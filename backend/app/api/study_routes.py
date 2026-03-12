from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Literal, Any

from app.generation.rag_engine import RAGEngine


router = APIRouter(
    prefix="/study",
    tags=["Study"],
)

rag_engine = RAGEngine()


class MCQRequest(BaseModel):
    query: str
    num_questions: int | None = 5


class FlashcardRequest(BaseModel):
    query: str
    num_cards: int | None = 8


class UserAnswer(BaseModel):
    question: str
    chosen: str
    correct: str
    is_correct: bool


class QuizAnalysisRequest(BaseModel):
    topic: str
    answers: List[UserAnswer]


@router.post("/quiz")
def generate_quiz(request: MCQRequest):
    try:
        result = rag_engine.generate_mcq_quiz(
            request.query,
            num_questions=request.num_questions or 5,
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quiz/analyze")
def analyze_quiz(request: QuizAnalysisRequest):
    try:
        # We don't actually need the full questions again; answers embed what we need.
        analysis_md = rag_engine.analyze_quiz_performance(
            topic=request.topic, questions=[], user_answers=[a.dict() for a in request.answers]
        )
        return {"status": "success", "data": {"analysis_markdown": analysis_md}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/flashcards")
def generate_flashcards(request: FlashcardRequest):
    try:
        cards = rag_engine.generate_flashcards(
            request.query,
            num_cards=request.num_cards or 8,
        )
        return {"status": "success", "data": {"cards": cards}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

