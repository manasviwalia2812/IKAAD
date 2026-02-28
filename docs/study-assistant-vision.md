# IKAAD Study Assistant – Product Vision & Roadmap

This document defines the study-assistant direction for IKAAD: feature set, design principles, and a phased implementation roadmap.

---

## Design Principle: Confirm Before Generating

**At each step, the AI must confirm with the user before generating a response.**

- For long-running tasks (summaries, learning plans, sample papers): show a short **plan** or **scope** and ask the user to approve (e.g., “I’ll summarize these 3 chapters. Proceed?”).
- For learning plans: ask for **chapters/syllabus** first, then propose a **plan**, then confirm before generating each phase.
- For doubt clearing and chat: optional confirmation for “heavy” answers (e.g., “Generate a detailed explanation?”) or implicit confirmation by user sending the message.
- UI pattern: **Preview intent → User confirms (Yes/Edit/Cancel) → Then generate.**

This keeps the assistant predictable, saves tokens, and gives users control.

---

## Feature Set

### 1. Summarize Documents (PDF / PPT / DOCX)

| Item | Description |
|------|-------------|
| **Scope** | User uploads one or more PDFs, PPTs, or DOCX files. |
| **Output** | Structured summary (key points, sections, takeaways). |
| **Confirmation** | “I’ll summarize [document name], [page/slide count]. Proceed?” → User confirms. |
| **Technical** | Reuse existing PDF loader; add PPTX (python-pptx) and DOCX (python-docx) loaders. Chunk and store in vector DB; use LLM to produce summary from chunks or full text for small docs. |

---

### 2. Explanations by Level + Diagrams/Graphs

| Item | Description |
|------|-------------|
| **Scope** | Explain a topic or section with **Beginner / Intermediate / Advanced** level. |
| **Output** | Explanation text + **diagrams/graphs** where useful. Prefer **extracting** figures from the document; otherwise generate (e.g., Mermaid, or image gen). |
| **Confirmation** | “Explain [topic] at [level] and include diagrams. Proceed?” |
| **Technical** | RAG for text; **image extraction** from PDF (e.g. PyMuPDF, pdf2image) and optionally from PPT/DOCX. Store image references in metadata; return image URLs or base64. For generated diagrams: Mermaid in frontend, or DALL-E/other API. |

---

### 3. Flashcards & Quizzes

| Item | Description |
|------|-------------|
| **Scope** | From selected document(s) or topic, generate flashcards and/or quizzes. |
| **Output** | Flashcards (front/back). Quizzes: MCQs or short-answer with correct answer and explanation. |
| **Confirmation** | “Generate 10 flashcards and 5 MCQs from [chapters/topics]. Proceed?” |
| **Technical** | RAG to get relevant chunks; LLM with structured output (JSON schema) for flashcard pairs and quiz items. Store in DB or return in API; frontend renders flip cards and quiz UI. |

---

### 4. Doubt Clearing (Back-and-Forth)

| Item | Description |
|------|-------------|
| **Scope** | Multi-turn chat: user asks doubts; AI answers with sources and follows up. |
| **Output** | Grounded answers + citations; optional “simplify” or “give an example.” |
| **Confirmation** | For normal replies: no extra confirmation. For “long explanation” or “generate summary of this thread”: optional “Generate?” confirmation. |
| **Technical** | Extend current RAG chat: keep conversation history (in memory or DB), include last N turns in context; same vector store. |

---

### 5. Sample Papers (From Past Papers + Syllabus)

| Item | Description |
|------|-------------|
| **Scope** | User uploads **previous year papers** and provides **current syllabus** (or selects chapters). AI generates a **sample paper** (same format: sections, marks, question types). |
| **Output** | Sample paper (PDF or structured JSON/HTML). |
| **Confirmation** | “Based on [N] past papers and syllabus [X], I’ll create a sample paper with [structure]. Proceed?” → optional “Regenerate section 2?”. |
| **Technical** | Ingest past papers (PDF); parse structure (sections, marks, types). Syllabus as document or form. LLM generates questions grounded in syllabus + style of past papers. Template for output; optional PDF export (e.g. WeasyPrint, reportlab). |

---

### 6. Learning Plan (Book + Syllabus)

| Item | Description |
|------|-------------|
| **Scope** | User uploads a **book** (PDF). AI asks for **chapters/syllabus** (or exam date). Then creates a **learning plan** (order, milestones, deadlines). |
| **Output** | Step-by-step plan (e.g., “Week 1: Ch 1–2, Week 2: Ch 3–4…”). At each step, AI can offer to summarize, explain, or quiz. |
| **Confirmation** | **Required at each step:** e.g. “Here’s the proposed plan: [outline]. Confirm?” Then “Start with Chapter 1? I’ll give a summary and key points.” → User confirms. |
| **Technical** | Ingest book; extract TOC/chapters (from PDF outline or LLM). Form or chat to collect syllabus/chapters/deadline. LLM produces plan; store plan in session/DB; chat or dedicated “plan” UI with confirm buttons. |

---

### 7. Lecture Recordings & YouTube Videos (Complex)

| Item | Description |
|------|-------------|
| **Scope** | User provides **video** (upload) or **YouTube URL**. AI transcribes, optionally summarizes, and allows Q&A over the content. |
| **Output** | Transcript, summary, timestamps; RAG over transcript for questions. |
| **Confirmation** | “Process this [length] video and create transcript + summary. Proceed?” |
| **Technical** | **YouTube:** yt-dlp + Whisper (or YouTube transcript API). **Uploaded video:** Whisper (or similar). Store transcript as document; chunk and embed; same RAG pipeline. Optional: store timestamps in metadata for “jump to moment.” |

---

### 8. Voice Chat (Viva / Interview Prep)

| Item | Description |
|------|-------------|
| **Scope** | User speaks; AI responds by voice. Use case: viva prep, interview practice. |
| **Output** | Voice-in → text (STT) → RAG + LLM → text → voice-out (TTS). |
| **Confirmation** | Optional: “Answer aloud?” or use push-to-talk so sending = confirm. |
| **Technical** | **STT:** Web Speech API or Whisper API. **TTS:** Web Speech API, ElevenLabs, or similar. Backend can remain text-based; frontend handles audio I/O and optional streaming. |

---

## Phased Roadmap

### Phase 1 – Core Study Loop (MVP)

**Goal:** One coherent flow: upload → summarize/explain → quiz → doubt chat.

1. **Document types:** Add **PPT** and **DOCX** support next to PDF.
2. **Summarize:** One endpoint + UI: select document → confirm → get summary.
3. **Explanation by level:** Dropdown (Beginner/Intermediate/Advanced) in chat; answers level-aware. No diagrams yet.
4. **Flashcards & quizzes:** Generate from current doc set; confirm scope → return flashcards + MCQs; simple UI (flip cards, quiz).
5. **Doubt clearing:** Full chat UI with history and citations (extend current RAG chat).
6. **Confirm-before-generate:** Implement for summarize, flashcards, and quizzes (preview + confirm button).

**Deliverable:** Deployable study assistant: upload materials, get summaries, level-based explanations, practice with flashcards/quizzes, and ask doubts with citations.

---

### Phase 2 – Diagrams, Plans, Sample Papers

**Goal:** Richer content and planning.

7. **Diagrams/graphs:** Extract images from PDFs/PPT; show in explanations. Optional: Mermaid for generated diagrams.
8. **Learning plan:** Book upload → form for chapters/syllabus/deadline → AI proposes plan → confirm → step-by-step with confirm at each step.
9. **Sample papers:** Upload past papers + syllabus → confirm structure → generate sample paper (download or view).

**Deliverable:** Learning plans and sample papers; explanations with figures.

---

### Phase 3 – Media & Voice

**Goal:** Video and voice.

10. **YouTube + lecture videos:** Ingest transcript (YouTube API or Whisper); summarize + RAG Q&A; “confirm before processing.”
11. **Voice chat:** STT + TTS in frontend; backend stays text; optional “answer aloud” or push-to-talk.

**Deliverable:** Study from videos and practice viva/interview via voice.

---

## Technical Stack Additions (Summary)

| Feature | Additions |
|--------|-----------|
| PPT | `python-pptx` (text + images) |
| DOCX | `python-docx` |
| Image extraction | PyMuPDF / `pdf2image` |
| Diagrams | Mermaid (frontend), optional image-gen API |
| Flashcards/Quizzes | Structured LLM output (JSON); simple DB or in-memory |
| Learning plan | Session or DB for plan state; confirm flow in API + UI |
| Sample papers | PDF export (e.g. WeasyPrint / reportlab) or HTML → print |
| Video | yt-dlp, Whisper (or API), transcript as docs |
| Voice | Web Speech API or Whisper (STT); Web Speech / ElevenLabs (TTS) |

---

## Success Criteria (High Level)

- **Summarize:** Any PDF/PPT/DOCX → one-click (after confirm) summary.
- **Explain:** Level selection + explanations; diagrams from docs or generated.
- **Practice:** Flashcards and quizzes from selected content; confirm before generate.
- **Doubt:** Multi-turn chat with sources; optional confirm for long answers.
- **Sample papers:** Past papers + syllabus → sample paper after confirm.
- **Learning plan:** Book + syllabus → plan with confirm at each step.
- **Video:** YouTube/lecture → transcript, summary, Q&A.
- **Voice:** Voice in/out for viva/interview practice.
- **UX:** “Confirm before generating” applied consistently for heavy operations.

This vision document is the single source of truth for the study assistant; implementation can follow the phases above and tick off items as they’re built.
