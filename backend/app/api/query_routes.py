from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.generation.rag_engine import RAGEngine

router = APIRouter(
    prefix="/query",
    tags=["Query"]
)

rag_engine = RAGEngine()


class QueryRequest(BaseModel):
    question: str


@router.post("/")
def query_documents(request: QueryRequest):
    try:
        result = rag_engine.answer_query_with_sources(request.question)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
