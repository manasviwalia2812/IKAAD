import os
import faiss
import numpy as np
import pickle
from typing import List, Any
from sentence_transformers import SentenceTransformer
from app.retrieval.embedding import EmbeddingManager


class FAISSVectorStore:
    def __init__(
        self,
        persistent_dir: str = "vectorstore",
        embedding_model: str = "all-MiniLM-L6-v2",
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ):
        self.persistent_dir = persistent_dir
        os.makedirs(self.persistent_dir, exist_ok=True)

        self.index = None
        self.metadata = []
        self.embedding_model = embedding_model
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def build_from_chunks(self, documents: List[Any]):
        print(f"[INFO] Generating embeddings for {len(documents)} chunks.")

        emb_pipe = EmbeddingManager(
            model_name=self.embedding_model,
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap
        )

        chunks = emb_pipe.chunk_documents(documents)
        embeddings = emb_pipe.embedding_chunks(chunks)

        metadatas = [{"text": chunk.page_content} for chunk in chunks]

        self.add_embeddings(
            np.array(embeddings).astype("float32"),
            metadatas
        )

        self.save()
        print(f"[INFO] FAISS index built and saved to {self.persistent_dir}")

    def add_embeddings(self, embeddings: np.ndarray, metadatas: List[Any] = None):
        dim = embeddings.shape[1]

        if self.index is None:
            self.index = faiss.IndexFlatL2(dim)

        self.index.add(embeddings)

        if metadatas:
            self.metadata.extend(metadatas)

        print(f"[INFO] Added {embeddings.shape[0]} embeddings.")

    def save(self):
        faiss_path = os.path.join(self.persistent_dir, "faiss.index")
        meta_path = os.path.join(self.persistent_dir, "metadata.pkl")

        faiss.write_index(self.index, faiss_path)

        with open(meta_path, "wb") as f:
            pickle.dump(self.metadata, f)

    def load(self):
        faiss_path = os.path.join(self.persistent_dir, "faiss.index")
        meta_path = os.path.join(self.persistent_dir, "metadata.pkl")

        self.index = faiss.read_index(faiss_path)

        with open(meta_path, "rb") as f:
            self.metadata = pickle.load(f)

        print(f"[INFO] FAISS index loaded from {self.persistent_dir}")

    def search(self, query_embedding: np.ndarray, top_k: int = 5):
        D, I = self.index.search(query_embedding, top_k)

        results = []
        for idx, dist in zip(I[0], D[0]):
            meta = self.metadata[idx] if idx < len(self.metadata) else None
            results.append(
                {"index": idx, "distance": dist, "metadata": meta}
            )

        return results

    def query(self, query: str, top_k: int = 5):
        print(f'[INFO] Querying vector store for: "{query}"')

        model = SentenceTransformer(self.embedding_model)
        query_embedding = model.encode([query]).astype("float32")

        return self.search(query_embedding, top_k=top_k)
