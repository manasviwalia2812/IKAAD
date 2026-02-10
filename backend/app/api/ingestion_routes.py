from fastapi import APIRouter, HTTPException
from app.ingestion.loader import load_documents_from_directory
from pathlib import Path

router = APIRouter(
    prefix="/ingestion",
    tags=["Ingestion"]
)


@router.post("/load")
def load_documents():
    """
    Trigger document ingestion from the configured data directory.
    """

    try:
        BASE_DIR = Path(__file__).resolve().parents[3]
        DATA_DIR = BASE_DIR / "data" / "pdf"

        docs = load_documents_from_directory(str(DATA_DIR))
        return {
            "status": "success",
            "documents_loaded": len(docs)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
