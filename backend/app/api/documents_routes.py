import os
import shutil
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.ingestion.loader import load_documents_from_directory
from app.retrieval.chunking import chunk_documents
from app.retrieval.vectorstore import FAISSVectorStore


router = APIRouter(prefix="/documents", tags=["Documents"])

BASE_DIR = Path(__file__).resolve().parents[3]
UPLOAD_DIR = BASE_DIR / "backend" / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

PERSIST_DIR = BASE_DIR / "backend" / "faiss_store"
PERSIST_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".pptx"}


def _clear_index_files() -> None:
    # Remove persisted FAISS artifacts
    if PERSIST_DIR.exists():
        shutil.rmtree(PERSIST_DIR, ignore_errors=True)
    PERSIST_DIR.mkdir(exist_ok=True)


def _rebuild_index_from_uploads() -> dict:
    documents = load_documents_from_directory(str(UPLOAD_DIR))
    if not documents:
        _clear_index_files()
        return {"documents_loaded": 0, "chunks_created": 0}

    chunks = chunk_documents(documents)
    store = FAISSVectorStore(
        persistent_dir=str(PERSIST_DIR),
        embedding_model="all-MiniLM-L6-v2",
    )
    store.build_from_chunks(chunks)
    return {"documents_loaded": len(documents), "chunks_created": len(chunks)}


@router.get("/")
def list_documents():
    files = []
    for p in sorted(UPLOAD_DIR.glob("*")):
        if not p.is_file():
            continue
        if p.suffix.lower() not in ALLOWED_EXTENSIONS:
            continue
        stat = p.stat()
        files.append(
            {
                "name": p.name,
                "size_bytes": stat.st_size,
                "modified_epoch": int(stat.st_mtime),
            }
        )
    return {"status": "success", "data": {"documents": files}}


@router.delete("/")
def delete_all_documents():
    # Delete uploads
    for p in UPLOAD_DIR.glob("*"):
        if p.is_file():
            try:
                p.unlink()
            except Exception:
                pass

    # Clear vector index
    _clear_index_files()
    return {"status": "success", "data": {"deleted": "all"}}


@router.delete("/{filename}")
def delete_document(filename: str):
    safe_name = Path(filename).name  # prevent path traversal
    target = UPLOAD_DIR / safe_name

    if not target.exists() or not target.is_file():
        raise HTTPException(status_code=404, detail="Document not found")

    # Only allow deleting supported documents
    if target.suffix.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported document type")

    try:
        target.unlink()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Rebuild index from remaining uploads so deleted doc is removed from memory
    rebuild_stats = _rebuild_index_from_uploads()
    return {
        "status": "success",
        "data": {"deleted": safe_name, "rebuild": rebuild_stats},
    }

