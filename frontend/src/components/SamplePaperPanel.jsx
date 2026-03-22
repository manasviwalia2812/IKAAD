import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { generateSampleExam, uploadPDFs } from "../api/api";

const QUESTION_STYLES = [
  { value: "balanced", label: "Balanced (mix of theory and numerical)" },
  { value: "numerical", label: "More numerical" },
  { value: "theory", label: "More theory" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export function SamplePaperPanel() {
  const [query, setQuery] = useState("");
  const [duration, setDuration] = useState(180);
  const [totalMarks, setTotalMarks] = useState(100);
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionStyle, setQuestionStyle] = useState("balanced");
  const [difficulty, setDifficulty] = useState("medium");
  const [optionalInstructions, setOptionalInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [paper, setPaper] = useState(null);
  const [error, setError] = useState(null);
  const [uploadFiles, setUploadFiles] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleUpload = async () => {
    if (!uploadFiles?.length) {
      setUploadStatus("Please select at least one file (PDF, DOCX, or PPTX).");
      return;
    }
    setUploading(true);
    setUploadStatus("");
    const formData = new FormData();
    for (let i = 0; i < uploadFiles.length; i++) {
      formData.append("files", uploadFiles[i]);
    }
    try {
      const res = await uploadPDFs(formData);
      if (res?.success) {
        setUploadStatus(`Uploaded ${res.documents_loaded ?? uploadFiles.length} file(s). You can now generate a sample paper.`);
        setUploadFiles(null);
      } else {
        setUploadStatus(res?.error || "Upload failed.");
      }
    } catch (e) {
      setUploadStatus(e.response?.data?.detail || e.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please enter a course or topic (e.g. course name or syllabus topic).");
      return;
    }
    setLoading(true);
    setError(null);
    setPaper(null);
    try {
      const res = await generateSampleExam(trimmed, {
        exam_duration_minutes: duration,
        total_marks: totalMarks,
        num_questions: numQuestions,
        question_style: questionStyle,
        difficulty,
        optional_instructions: optionalInstructions.trim() || undefined,
      });
      const text = res?.data?.paper;
      if (text) setPaper(text);
      else setError("No paper was returned.");
    } catch (e) {
      setError(
        e.response?.data?.detail || e.message || "Failed to generate sample paper. Ensure documents are uploaded and the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="samplePaperPanel">
      <h2 style={{ margin: "0 0 6px" }}>Sample Paper Generator</h2>
      <p style={{ color: "var(--muted)", margin: "0 0 14px", fontSize: "0.95rem" }}>
        Upload syllabus and previous year papers in the Documents section (or below), then generate a practice exam.
      </p>

      <div className="samplePaperSection">
        <h3 className="samplePaperSectionTitle">Upload syllabus / previous year papers</h3>
        <p style={{ color: "var(--muted)", margin: "0 0 8px", fontSize: "0.9rem" }}>
          Add PDF, DOCX, or PPTX files. They will be indexed and used when generating the paper.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <input
            type="file"
            accept=".pdf,.docx,.pptx"
            multiple
            onChange={(e) => setUploadFiles(e.target.files)}
          />
          <button type="button" onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading…" : "Upload files"}
          </button>
        </div>
        {uploadStatus && (
          <p style={{ margin: "8px 0 0", fontSize: "0.9rem", color: "var(--muted)" }}>
            {uploadStatus}
          </p>
        )}
      </div>

      <div className="samplePaperSection">
        <h3 className="samplePaperSectionTitle">Course / topic</h3>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Mathematics 101, Cryptography syllabus, Unit 3–5"
          className="samplePaperInput"
        />
      </div>

      <div className="samplePaperSection">
        <h3 className="samplePaperSectionTitle">Exam settings</h3>
        <div className="samplePaperGrid">
          <label>
            <span>Duration (minutes)</span>
            <input
              type="number"
              min={30}
              max={300}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 180)}
            />
          </label>
          <label>
            <span>Total marks</span>
            <input
              type="number"
              min={10}
              max={200}
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value) || 100)}
            />
          </label>
          <label>
            <span>Number of questions</span>
            <input
              type="number"
              min={5}
              max={30}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value) || 10)}
            />
          </label>
          <label>
            <span>Question style</span>
            <select
              value={questionStyle}
              onChange={(e) => setQuestionStyle(e.target.value)}
              className="select"
              style={{ maxWidth: "100%" }}
            >
              {QUESTION_STYLES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Difficulty</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="select"
              style={{ maxWidth: "100%" }}
            >
              {DIFFICULTIES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="samplePaperSection">
        <h3 className="samplePaperSectionTitle">Optional instructions</h3>
        <textarea
          value={optionalInstructions}
          onChange={(e) => setOptionalInstructions(e.target.value)}
          placeholder="e.g. Focus on Chapter 2 and 3; include one proof-based question."
          rows={3}
          className="samplePaperTextarea"
        />
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="samplePaperGenerateBtn"
      >
        {loading ? "Generating sample paper…" : "Generate Sample Paper"}
      </button>

      {error && (
        <div className="samplePaperError" role="alert">
          {error}
        </div>
      )}

      {paper && (
        <div className="samplePaperResult">
          <h3 className="samplePaperResultTitle">Generated exam paper</h3>
          <div className="samplePaperResultContent">
            <ReactMarkdown
              components={{
                h1: ({ node, ...p }) => <h1 className="samplePaperH1" {...p} />,
                h2: ({ node, ...p }) => <h2 className="samplePaperH2" {...p} />,
                h3: ({ node, ...p }) => <h3 className="samplePaperH3" {...p} />,
                p: ({ node, ...p }) => <p className="samplePaperP" {...p} />,
                ul: ({ node, ...p }) => <ul className="samplePaperUl" {...p} />,
                ol: ({ node, ...p }) => <ol className="samplePaperOl" {...p} />,
                li: ({ node, ...p }) => <li className="samplePaperLi" {...p} />,
                strong: ({ node, ...p }) => <strong className="samplePaperStrong" {...p} />,
              }}
            >
              {paper}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
