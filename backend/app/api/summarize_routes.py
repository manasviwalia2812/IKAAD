from fastapi import APIRouter, HTTPException, Header
from app.generation.rag_engine import RAGEngine

router = APIRouter(
    prefix="/summarize",
    tags=["Summarize"],
)

rag_engine = RAGEngine()


@router.post("/")
def summarize_all(x_groq_key: str | None = Header(default=None)):
    """Summarize all currently ingested documents."""
    try:
        engine = rag_engine.with_api_key(x_groq_key)
        result = engine.summarize_all()
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
