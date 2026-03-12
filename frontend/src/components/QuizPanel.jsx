import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { generateQuiz, analyzeQuiz } from "../api/api";

export function QuizPanel() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null); // { questions: [...] }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState([]); // [{question, chosen, correct, is_correct}]
  const [score, setScore] = useState({ total: 0, correct: 0, wrong: 0 });
  const [completed, setCompleted] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleStartQuiz = async () => {
    const trimmed = topic.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    setQuiz(null);
    setAnalysis(null);
    setCompleted(false);
    setCurrentIndex(0);
    setSelected(null);
    setFeedback(null);
    setAnswers([]);
    setScore({ total: 0, correct: 0, wrong: 0 });

    try {
      const res = await generateQuiz(trimmed, 5);
      const questions = res?.data?.questions || [];
      if (!questions.length) {
        setError("No questions could be generated. Try a different topic or upload more material.");
        return;
      }
      setQuiz({ questions });
      setScore((prev) => ({ ...prev, total: questions.length }));
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to generate quiz. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion =
    quiz && quiz.questions && quiz.questions.length > 0
      ? quiz.questions[currentIndex]
      : null;

  const handleSubmitAnswer = () => {
    if (!currentQuestion || selected == null) return;

    const isCorrect = selected === currentQuestion.correct_answer;
    const newAnswer = {
      question: currentQuestion.question,
      chosen: selected,
      correct: currentQuestion.correct_answer,
      is_correct: isCorrect,
    };

    setAnswers((prev) => [...prev, newAnswer]);
    setScore((prev) => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
    }));

    setFeedback({
      isCorrect,
      explanation: currentQuestion.explanation,
    });
  };

  const handleNextQuestion = async () => {
    if (!quiz) return;
    const lastIndex = quiz.questions.length - 1;

    if (currentIndex < lastIndex) {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
      setFeedback(null);
    } else {
      // Quiz completed – request analysis
      setCompleted(true);
      setAnalysisLoading(true);
      try {
        const res = await analyzeQuiz(topic.trim(), answers);
        setAnalysis(res?.data?.analysis_markdown || null);
      } catch (err) {
        setAnalysis(
          err.response?.data?.detail ||
            err.message ||
            "Could not generate analysis. Please try again."
        );
      } finally {
        setAnalysisLoading(false);
      }
    }
  };

  const handleRestart = () => {
    setQuiz(null);
    setCurrentIndex(0);
    setSelected(null);
    setFeedback(null);
    setAnswers([]);
    setScore({ total: 0, correct: 0, wrong: 0 });
    setCompleted(false);
    setAnalysis(null);
    setError(null);
  };

  return (
    <div>
      <h2 style={{ margin: "0 0 6px" }}>Interactive MCQ Quiz</h2>
      <p style={{ color: "var(--muted)", margin: "0 0 12px", fontSize: "0.95rem" }}>
        Generate conceptual MCQs based on your uploaded material.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic or concept (e.g. AES, neural networks)"
          style={{
            padding: "0.6rem 0.75rem",
            borderRadius: 8,
            border: "1px solid var(--border)",
            fontSize: "0.95rem",
            backgroundColor: "var(--input-bg)",
          }}
        />
        <button type="button" onClick={handleStartQuiz} disabled={!topic.trim() || loading}>
          {loading ? "Generating quiz…" : "Start quiz"}
        </button>
        {error && (
          <p style={{ color: "#e74c3c", margin: 0, fontSize: "0.9rem" }}>{error}</p>
        )}
      </div>

      {quiz && currentQuestion && (
        <div
          style={{
            borderRadius: 18,
            border: "1px solid var(--border)",
            backgroundColor: "var(--chat-bg)",
            padding: "1.25rem 1.5rem",
            maxWidth: 700,
            margin: "0 auto 1rem",
            boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
              fontSize: "0.95rem",
              color: "var(--muted)",
            }}
          >
            <span>
              Question {currentIndex + 1} of {quiz.questions.length}
            </span>
            <span>
              Score: {score.correct} / {score.total}
            </span>
          </div>

          <div
            style={{
              fontSize: "1.05rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            {currentQuestion.question}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selected === opt;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelected(opt)}
                  style={{
                    textAlign: "left",
                    borderRadius: 999,
                    padding: "0.5rem 0.85rem",
                    fontSize: "0.98rem",
                    border: isSelected
                      ? "2px solid var(--accent)"
                      : "1px solid var(--border)",
                    background:
                      isSelected && !feedback
                        ? "linear-gradient(135deg, var(--accent), var(--accent-2))"
                        : "rgba(255,255,255,0.04)",
                    color: isSelected && !feedback ? "#fff" : "var(--text)",
                    cursor: "pointer",
                    transition:
                      "transform 0.12s ease, border-color 0.12s ease, background 0.12s ease",
                  }}
                >
                  <span style={{ marginRight: "0.5rem", opacity: 0.8 }}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "0.9rem",
              gap: "0.75rem",
            }}
          >
            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={selected == null || !!feedback}
            >
              Submit answer
            </button>
            {completed ? (
              <button type="button" onClick={handleRestart}>
                Restart quiz
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={!feedback}
                style={{ opacity: feedback ? 1 : 0.6 }}
              >
                {currentIndex === quiz.questions.length - 1
                  ? "Finish quiz"
                  : "Next question"}
              </button>
            )}
          </div>

          {feedback && (
            <div
              style={{
                marginTop: "0.9rem",
                padding: "0.75rem 0.85rem",
                borderRadius: 10,
                backgroundColor: feedback.isCorrect
                  ? "rgba(34,197,94,0.18)"
                  : "rgba(248,113,113,0.18)",
                border: `1px solid ${
                  feedback.isCorrect ? "rgba(34,197,94,0.6)" : "rgba(248,113,113,0.7)"
                }`,
                fontSize: "0.95rem",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                {feedback.isCorrect ? "Correct!" : "Incorrect"}
              </div>
              {!feedback.isCorrect && (
                <div style={{ marginBottom: "0.25rem" }}>
                  <strong>Correct answer:</strong> {currentQuestion.correct_answer}
                </div>
              )}
              {feedback.explanation && (
                <div style={{ opacity: 0.95 }}>{feedback.explanation}</div>
              )}
            </div>
          )}
        </div>
      )}

      {completed && (
        <div
          style={{
            marginTop: "0.75rem",
            padding: "1rem 1.1rem",
            borderRadius: 14,
            border: "1px solid var(--border)",
            backgroundColor: "var(--panel-2)",
          }}
        >
          <h3 style={{ margin: "0 0 0.4rem", fontSize: "1.05rem" }}>Quiz summary</h3>
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.95rem" }}>
            Score:{" "}
            <strong>
              {score.correct} / {score.total}
            </strong>
          </p>
          {analysisLoading && (
            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)" }}>
              Generating performance analysis…
            </p>
          )}
          {analysis && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.95rem" }}>
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => (
                    <p style={{ margin: "0 0 0.45rem" }} {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      style={{ paddingLeft: "1.25rem", margin: "0 0 0.45rem" }}
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li style={{ marginBottom: "0.25rem" }} {...props} />
                  ),
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

