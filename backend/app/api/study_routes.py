from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from app.generation.rag_engine import RAGEngine
from app.generation.exam_generator import generate_sample_exam


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


class ExamConfig(BaseModel):
    exam_duration_minutes: int | None = 180
    total_marks: int | None = 100
    num_questions: int | None = 10
    question_style: str | None = "balanced"  # numerical | theory | balanced
    difficulty: str | None = "medium"
    optional_instructions: str | None = None


class SampleExamRequest(BaseModel):
    query: str
    exam_config: ExamConfig | None = None


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


@router.post("/sample-exam")
def generate_sample_exam_route(request: SampleExamRequest):
    try:
        config = request.exam_config or ExamConfig()
        retriever = lambda q, k: rag_engine.get_retrieval_chunks(q, top_k=k)
        config_dict = config.model_dump(exclude_none=True) if hasattr(config, "model_dump") else config.dict(exclude_none=True)
        paper = generate_sample_exam(
            request.query,
            retriever,
            rag_engine.llm,
            config_dict,
        )
        return {"status": "success", "data": {"paper": paper}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

