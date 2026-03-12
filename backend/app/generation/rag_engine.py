import os
from typing import List
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

