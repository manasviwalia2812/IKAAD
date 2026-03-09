from fastapi import APIRouter, HTTPException
from app.generation.rag_engine import RAGEngine

router = APIRouter(
    prefix="/summarize",
    tags=["Summarize"],
)

rag_engine = RAGEngine()


@router.post("/")
def summarize_all():
    """Summarize all currently ingested documents."""
    try:
        result = rag_engine.summarize_all()
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
