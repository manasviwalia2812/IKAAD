import os
from typing import List
import json
from dotenv import load_dotenv
from langchain_groq import ChatGroq

from app.retrieval.vectorstore import FAISSVectorStore
from pathlib import Path

load_dotenv()


class RAGEngine:
    def __init__(
        self,
        persist_dir: str = "faiss_store",
        embedding_model: str = "all-MiniLM-L6-v2",
        llm_model: str = "llama-3.3-70b-versatile",
        top_k: int = 10,
    ):
        self.top_k = top_k

        # Resolve persist directory relative to backend/ for consistency
        base_dir = Path(__file__).resolve().parents[3]
        persist_path = Path(persist_dir)
        if not persist_path.is_absolute():
            persist_dir = str(base_dir / "backend" / persist_dir)

        # Vector store (DO NOT load here)
        self.vector_store = FAISSVectorStore(
            persistent_dir=persist_dir,
            embedding_model=embedding_model,
        )

        # Load LLM
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")

        self.llm = ChatGroq(
            api_key=groq_api_key,
            model=llm_model,
        )
    
    LEVEL_INSTRUCTIONS = {
        "beginner": "Explain in simple language suitable for a beginner. Avoid jargon; use everyday words and short sentences. If you must use a technical term, define it briefly.",
        "intermediate": "Explain at an intermediate level. You may use standard terminology and assume basic familiarity with the subject.",
        "advanced": "Explain at an advanced level. Use precise terminology and you may assume the reader has prior knowledge of the field.",
    }

    def answer_query_with_sources(self, query: str, level: str = "intermediate"):
      if not self._ensure_index_loaded():
          return {
              "answer": "No documents have been uploaded yet.",
              "sources": [],
              "confidence": 0.0
          }

      results = self.vector_store.query(query, top_k=self.top_k)

      if not results:
          return {
              "answer": "No relevant information found.",
              "sources": [],
              "confidence": 0.0
          }

      texts = []
      sources = []

      for r in results:
          meta = r.get("metadata", {})
          text = meta.get("text", "")
          if text:
              texts.append(text)
              src = meta.get("source")
              src_name = Path(str(src)).name if src else "unknown"
              sources.append(f"{src_name}: {text[:200]}")

      context = "\n\n".join(texts)
      level_key = (level or "intermediate").lower()
      level_instruction = self.LEVEL_INSTRUCTIONS.get(
          level_key, self.LEVEL_INSTRUCTIONS["intermediate"]
      )

      prompt = f"""You are an academic knowledge assistant.
      {level_instruction}

      Rules:
      - Use ONLY the provided context. Do not use outside knowledge.
      - If the context clearly does NOT contain the answer and is unrelated, say: "I do not know based on the provided documents."
      - If the context contains some related information but is insufficient to fully answer, do NOT refuse. Instead:
        1) State what you found (briefly, grounded in the context).
        2) Ask 1-2 clarifying questions that would let you answer precisely (offer a couple of options if helpful).
      - If the answer is present, answer directly and cite key details from the context in your wording.
      - Format your entire answer as clean Markdown. Use:
        * A short heading or bolded first line for the main takeaway.
        * Bulleted or numbered lists for steps, key points, and examples.
        * Subheadings for different sections when helpful.
        * Markdown code blocks only when you need to show literal code or formulas.

      Context:
      {context}

      Question:
      {query}

      Answer in Markdown:
      """

      response = self.llm.invoke(prompt)

      confidence = round(min(1.0, len(texts) / self.top_k), 2)

      return {
          "answer": response.content,
          "sources": sources,
          "confidence": confidence
      }

    def _build_context_for_query(self, query: str) -> List[str]:
        """Shared helper to retrieve context chunks for study tools (quiz, flashcards)."""
        if not self._ensure_index_loaded():
            return []

        results = self.vector_store.query(query, top_k=self.top_k)
        if not results:
            return []

        texts: List[str] = []
        for r in results:
            meta = r.get("metadata", {})
            text = meta.get("text", "")
            if text:
                texts.append(text)

        return texts

    def _invoke_json_llm(self, prompt: str):
        """Call the LLM and robustly parse a JSON response from its content."""
        response = self.llm.invoke(prompt)
        raw = response.content.strip()
        # Remove optional markdown fences if present
        if raw.startswith("```"):
            # strip first line and trailing fence
            lines = raw.splitlines()
            # drop first ```... line and any final ``` line
            inner = "\n".join(
                line for line in lines[1:] if not line.strip().startswith("```")
            )
            raw = inner.strip()
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            # Fallback: try to locate first/last braces
            start = raw.find("{")
            end = raw.rfind("}")
            if start != -1 and end != -1 and end > start:
                try:
                    return json.loads(raw[start : end + 1])
                except json.JSONDecodeError:
                    pass
            raise

    def generate_mcq_quiz(self, query: str, num_questions: int = 5) -> dict:
        """
        Generate an MCQ quiz based on RAG context.

        Returns a structured JSON object:
        {
          "questions": [
            {
              "question": "...",
              "options": ["A", "B", "C", "D"],
              "correct_answer": "B",
              "explanation": "..."
            }
          ]
        }
        """
        texts = self._build_context_for_query(query)
        if not texts:
            return {"questions": []}

        context = "\n\n".join(texts)
        prompt = f"""
You are a study assistant that creates high‑quality multiple‑choice quizzes.

Use ONLY the provided context to create conceptual questions. Avoid trivial
memorization (like dates or page numbers) and focus on understanding.

TASK:
- Generate exactly {num_questions} multiple-choice questions.
- Each question must have 4 options.
- Exactly ONE option must be correct.
- Provide a short explanation for each question that clarifies why the answer is correct.

CONTEXT (study material):
{context}

RESPONSE FORMAT (VERY IMPORTANT):
Return ONLY valid JSON with this exact shape, no extra commentary or text:
{{
  "questions": [
    {{
      "question": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correct_answer": "the EXACT text of the correct option from options[]",
      "explanation": "short explanation using the context"
    }}
  ]
}}
"""
        try:
            parsed = self._invoke_json_llm(prompt)
        except Exception:
            # If parsing fails, degrade gracefully
            return {"questions": []}

        # Basic validation / normalization
        questions = parsed.get("questions") or []
        normalized = []
        for q in questions:
            question = str(q.get("question", "")).strip()
            options = q.get("options") or []
            options = [str(o).strip() for o in options if str(o).strip()]
            correct_answer = str(q.get("correct_answer", "")).strip()
            explanation = str(q.get("explanation", "")).strip()
            if question and len(options) >= 2 and correct_answer:
                # Ensure correct_answer is one of the options; if not, default to first
                if correct_answer not in options:
                    correct_answer = options[0]
                normalized.append(
                    {
                        "question": question,
                        "options": options,
                        "correct_answer": correct_answer,
                        "explanation": explanation,
                    }
                )

        return {"questions": normalized}

    def analyze_quiz_performance(self, topic: str, questions: List[dict], user_answers: List[dict]) -> str:
        """
        Use the LLM to generate a brief performance analysis for the completed quiz.

        `questions` is the normalized list from generate_mcq_quiz.
        `user_answers` is a list of dicts like:
        { "question": "...", "chosen": "...", "correct": "...", "is_correct": true/false }
        """
        # Build a compact representation for the model
        summary_lines: List[str] = []
        for idx, qa in enumerate(user_answers, start=1):
            summary_lines.append(
                f"Q{idx}: {qa.get('question')}\n"
                f"- chosen: {qa.get('chosen')}\n"
                f"- correct: {qa.get('correct')}\n"
                f"- is_correct: {qa.get('is_correct')}"
            )
        quiz_summary = "\n\n".join(summary_lines)

        prompt = f"""
You are a tutoring assistant analyzing a student's quiz performance.

TOPIC: {topic}

QUIZ RESULTS:
{quiz_summary}

TASK:
- Identify strong areas (what they clearly understand).
- Identify weak areas or misconceptions.
- Give 2‑4 concrete, encouraging study recommendations.

FORMAT your response in concise Markdown with:
- A short heading.
- Bullet points for strengths and improvement areas.
- A brief closing note of encouragement.
"""
        response = self.llm.invoke(prompt)
        return response.content

    def generate_flashcards(self, query: str, num_cards: int = 8) -> List[dict]:
        """
        Generate flashcards from RAG context.

        Returns a list of cards:
        [
          {"front": "...", "back": "..."}
        ]
        """
        texts = self._build_context_for_query(query)
        if not texts:
            return []

        context = "\n\n".join(texts)
        prompt = f"""
You are a study assistant that creates helpful flashcards.

Use ONLY the provided context to create concept‑focused flashcards.
Avoid trivial facts; focus on definitions, relationships, and key ideas.

TASK:
- Generate up to {num_cards} flashcards.
- Each card should have a clear, short question or prompt on the front.
- The back should contain a concise but complete explanation or answer.

CONTEXT (study material):
{context}

RESPONSE FORMAT (JSON ONLY):
[
  {{
    "front": "short question or prompt",
    "back": "concise explanation or answer"
  }}
]
"""
        try:
            cards = self._invoke_json_llm(prompt)
        except Exception:
            return []

        normalized: List[dict] = []
        if isinstance(cards, list):
            candidate_cards = cards
        else:
            candidate_cards = cards.get("cards") or []

        for c in candidate_cards:
            front = str(c.get("front", "")).strip()
            back = str(c.get("back", "")).strip()
            if front and back:
                normalized.append({"front": front, "back": back})

        # Limit to num_cards
        return normalized[: num_cards]

    def _ensure_index_loaded(self):
      try:
          self.vector_store.load()
          return True
      except Exception:
          return False

    # Max chars to send to LLM for summarization (avoid token limit)
    SUMMARY_MAX_CHARS = 80_000

    def summarize_all(self) -> dict:
        """Summarize all ingested documents. Returns summary and chunk count."""
        if not self._ensure_index_loaded():
            return {
                "summary": "No documents have been uploaded yet.",
                "chunks_used": 0,
            }
        texts = self.vector_store.get_all_texts()
        if not texts:
            return {"summary": "No content found in the index.", "chunks_used": 0}
        combined = "\n\n".join(texts)
        if len(combined) > self.SUMMARY_MAX_CHARS:
            combined = combined[: self.SUMMARY_MAX_CHARS] + "\n\n[Content truncated for length.]"
        prompt = f"""You are an academic study assistant. Summarize the following document content clearly and concisely.

Provide:
1. A short overall summary (2-4 sentences).
2. Key points or section summaries as bullet points.
3. Any important definitions or concepts mentioned.

Use only the content below. Do not add information that is not in the text.

Content:
{combined}

Summary:
"""
        response = self.llm.invoke(prompt)
        return {
            "summary": response.content,
            "chunks_used": len(texts),
        }
    
    def answer_query(self, query: str) -> str:
      if not self._ensure_index_loaded():
          return "No documents have been uploaded yet."

      results = self.vector_store.query(query, top_k=self.top_k)

      texts = [
          r["metadata"].get("text", "")
          for r in results
          if r.get("metadata")
      ]

      if not texts:
          return "No relevant information found in the documents."

      context = "\n\n".join(texts)

      prompt = f"""
  You are an academic knowledge assistant.
  Answer the question using ONLY the provided context.
  If the answer is not present, say you do not know.

  Context:
  {context}

  Question:
  {query}

  Answer:
  """

      response = self.llm.invoke(prompt)
      return response.content

      """
      Perform RAG-based answering and return answer with sources and confidence.
      """

      results = self.vector_store.query(query, top_k=self.top_k)

      if not results:
          return {
              "answer": "No relevant information found.",
              "sources": [],
              "confidence": 0.0
          }

      texts = []
      sources = []

      for r in results:
          meta = r.get("metadata", {})
          text = meta.get("text", "")
          if text:
              texts.append(text)
              sources.append(text[:200])  # preview for now

      context = "\n\n".join(texts)

      prompt = f"""
  You are an academic knowledge assistant.

  Answer the question using ONLY the provided context.
  If the answer is not present, say "I do not know".

  Context:
  {context}

  Question:
  {query}

  Answer:
  """

      response = self.llm.invoke(prompt)

      # Simple confidence heuristic (very explainable)
      confidence = round(min(1.0, len(texts) / self.top_k), 2)

      return {
          "answer": response.content,
          "sources": sources,
          "confidence": confidence
      }

