from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from app.generation.rag_engine import RAGEngine

router = APIRouter(
    prefix="/query",
    tags=["Query"]
)

rag_engine = RAGEngine()


class QueryRequest(BaseModel):
    question: str
    level: str | None = "intermediate"  # beginner | intermediate | advanced


@router.post("/")
def query_documents(request: QueryRequest, x_groq_key: str | None = Header(default=None)):
    try:
        engine = rag_engine.with_api_key(x_groq_key)
        result = engine.answer_query_with_sources(
            request.question, level=request.level or "intermediate"
        )
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
