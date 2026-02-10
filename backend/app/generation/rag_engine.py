import os
from typing import List
from dotenv import load_dotenv
from langchain_groq import ChatGroq

from app.retrieval.vectorstore import FAISSVectorStore

load_dotenv()


class RAGEngine:
    def __init__(
        self,
        persist_dir: str = "faiss_store",
        embedding_model: str = "all-MiniLM-L6-v2",
        llm_model: str = "llama-3.3-70b-versatile",
        top_k: int = 5,
    ):
        self.top_k = top_k

        # Load vector store (assumes it is already built)
        self.vector_store = FAISSVectorStore(
            persistent_dir=persist_dir,
            embedding_model=embedding_model,
        )
        self.vector_store.load()

        # Load LLM
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")

        self.llm = ChatGroq(
            api_key=groq_api_key,
            model=llm_model,
        )

    def answer_query(self, query: str) -> str:
        """
        Perform RAG-based answering:
        - retrieve relevant chunks
        - build context
        - generate grounded answer
        """

        results = self.vector_store.query(query, top_k=self.top_k)

        texts: List[str] = [
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
    
    def answer_query_with_sources(self, query: str):
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

