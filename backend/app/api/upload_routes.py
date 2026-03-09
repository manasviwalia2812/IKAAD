import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.ingestion.loader import load_documents_from_directory
from app.retrieval.chunking import chunk_documents
from app.retrieval.vectorstore import FAISSVectorStore
from fastapi.responses import JSONResponse

from pathlib import Path

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)

# Resolve upload directory safely
BASE_DIR = Path(__file__).resolve().parents[3]
UPLOAD_DIR = BASE_DIR / "backend" / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
PERSIST_DIR = BASE_DIR / "backend" / "faiss_store"
PERSIST_DIR.mkdir(exist_ok=True)


ALLOWED_EXTENSIONS = {".pdf", ".docx", ".pptx"}


@router.post("/")
def upload_documents(files: list[UploadFile] = File(...)):
    try:
        # 1️⃣ Save uploaded files
        for file in files:
            ext = Path(file.filename).suffix.lower()
            if ext not in ALLOWED_EXTENSIONS:
                raise HTTPException(
                    status_code=400,
                    detail=f"Only PDF, DOCX, and PPTX files are allowed. Got: {ext or 'no extension'}",
                )
            file_path = UPLOAD_DIR / file.filename
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

        # 2️⃣ Load documents from uploads
        documents = load_documents_from_directory(str(UPLOAD_DIR))

        # 3️⃣ Chunk documents
        chunks = chunk_documents(documents)

        # 4️⃣ Build FAISS index
        store = FAISSVectorStore(
            persistent_dir=str(PERSIST_DIR),
            embedding_model="all-MiniLM-L6-v2"
        )
        store.build_from_chunks(chunks)

        return {
            "success": True,
            "files_uploaded": len(files),
            "documents_loaded": len(documents),
            "chunks_created": len(chunks)
        }

    except HTTPException:
        raise  # Let FastAPI handle HTTPException properly
        
    except Exception as e:
        # Return 500 status code for server errors
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )