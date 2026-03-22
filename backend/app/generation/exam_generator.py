"""
Sample exam paper generator using RAG context.
Uses syllabus and optional previous-year patterns to produce a structured exam paper.
"""

from typing import List, Callable, Any


def generate_sample_exam(
    query: str,
    retriever: Callable[[str, int], List[str]],
    llm: Any,
    exam_config: dict,
) -> str:
    """
    Generate a realistic sample exam paper from syllabus and past-question context.

    Args:
        query: Topic/course description used to retrieve syllabus and past papers.
        retriever: Callable(query, top_k) -> list of text chunks from documents.
        llm: LLM with .invoke(prompt) returning an object with .content (e.g. LangChain).
        exam_config: Dict with:
            - exam_duration_minutes: int
            - total_marks: int
            - num_questions: int (total across sections)
            - question_style: "numerical" | "theory" | "balanced"
            - difficulty: "easy" | "medium" | "hard"
            - optional_instructions: str (optional)

    Returns:
        Structured exam paper text (markdown-friendly) for display in UI.
    """
    top_k = 20
    chunks = retriever(query, top_k)
    if not chunks:
        return (
            "No relevant syllabus or past papers found in the uploaded documents. "
            "Please upload syllabus and/or previous year papers in the Documents section, then try again."
        )

    context = "\n\n---\n\n".join(chunks)

    duration = exam_config.get("exam_duration_minutes") or 180
    total_marks = exam_config.get("total_marks") or 100
    num_questions = exam_config.get("num_questions") or 10
    style = (exam_config.get("question_style") or "balanced").lower()
    difficulty = (exam_config.get("difficulty") or "medium").lower()
    extra = (exam_config.get("optional_instructions") or "").strip()

    style_map = {
        "numerical": "Focus on numerical problems, calculations, and applied problems; include clear sub-parts where appropriate.",
        "theory": "Focus on theory, definitions, short explanations, and conceptual questions; minimal numerical work.",
        "balanced": "Mix of short theory, medium-length explanations, and some numerical problems across sections.",
    }
    style_instruction = style_map.get(style, style_map["balanced"])

    difficulty_map = {
        "easy": "Questions should be straightforward, testing basic understanding and recall.",
        "medium": "Mix of direct and applied questions; moderate complexity.",
        "hard": "Include challenging, application-based and analytical questions suitable for advanced students.",
    }
    difficulty_instruction = difficulty_map.get(difficulty, difficulty_map["medium"])

    prompt = f"""You are an experienced exam setter. Your task is to generate a NEW sample question paper for practice.

Use ONLY the following context (syllabus and/or previous year question patterns). Do not repeat exact questions from the context; create new questions that follow the same style, topics, and difficulty.

CONTEXT (syllabus / past papers):
{context}

STUDENT REQUEST / TOPIC:
{query}

EXAM SPECIFICATIONS:
- Duration: {duration} minutes
- Total marks: {total_marks}
- Total number of questions (across all sections): {num_questions}
- Question style: {style_instruction}
- Difficulty: {difficulty_instruction}
{f'- Additional instructions from student: {extra}' if extra else ''}

OUTPUT FORMAT (use this exact structure so it can be displayed cleanly in the UI):

# [Title of the Exam Paper]

**Exam duration:** [X] minutes  
**Total marks:** [Y]

---

## Section A – Short Answer
[2–4 questions, 2–5 marks each. One or two sentence answers.]

---

## Section B – Medium Answer
[2–4 questions, 5–10 marks each. Paragraph or short structured answers.]

---

## Section C – Long Answer
[1–3 questions, 10–20 marks each. Essay-style or multi-part answers.]

---
[If question_style is "numerical" or "balanced", add:]
## Numerical Problems (optional)
[1–3 numerical problems with clear sub-parts and mark distribution.]

---

Generate the full paper below. Use clear numbering (1, 2, 3... or 1(a), 1(b)...). Include mark allocation for each question or part. Do not include model answers.
"""

    response = llm.invoke(prompt)
    return getattr(response, "content", str(response))
