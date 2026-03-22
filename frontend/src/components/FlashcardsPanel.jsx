import { useState } from "react";
import { generateFlashcardsApi } from "../api/api";

export function FlashcardsPanel() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | out | in
  const [flipped, setFlipped] = useState(false);

  const handleGenerate = async () => {
    const trimmed = topic.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    setCards([]);
    setIndex(0);
    setPhase("idle");
    setFlipped(false);

    try {
      const res = await generateFlashcardsApi(trimmed, 8);
      const newCards = res?.data?.cards || [];
      setCards(newCards);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to generate flashcards. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const current = cards[index] || null;

  const next = () => {
    if (!cards.length || index >= cards.length - 1 || phase !== "idle") return;
    setPhase("out");
    window.setTimeout(() => {
      setIndex((prev) => prev + 1);
      setFlipped(false);
      setPhase("in");
      window.setTimeout(() => setPhase("idle"), 220);
    }, 220);
  };

  const prev = () => {
    if (!cards.length || index <= 0 || phase !== "idle") return;
    setPhase("out");
    window.setTimeout(() => {
      setIndex((p) => p - 1);
      setFlipped(false);
      setPhase("in");
      window.setTimeout(() => setPhase("idle"), 220);
    }, 220);
  };

  return (
    <div>
      <h2 style={{ margin: "0 0 6px" }}>AI Flashcards</h2>
      <p style={{ color: "var(--muted)", margin: "0 0 12px", fontSize: "0.95rem" }}>
        Generate visual flashcards from your study material.
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
          placeholder="Topic or chapter (e.g. block ciphers, linear algebra)"
          style={{
            padding: "0.6rem 0.75rem",
            borderRadius: 8,
            border: "1px solid var(--border)",
            fontSize: "0.95rem",
            backgroundColor: "var(--input-bg)",
          }}
        />
        <button type="button" onClick={handleGenerate} disabled={!topic.trim() || loading}>
          {loading ? "Generating flashcards…" : "Generate flashcards"}
        </button>
        {error && (
          <p style={{ color: "#e74c3c", margin: 0, fontSize: "0.9rem" }}>{error}</p>
        )}
      </div>

      {cards.length > 0 && current && (
        <div className="flashDeck">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
              color: "var(--muted)",
              fontSize: "0.9rem",
            }}
          >
            <span>
              Card <strong style={{ color: "var(--text)" }}>{index + 1}</strong> of{" "}
              <strong style={{ color: "var(--text)" }}>{cards.length}</strong>
            </span>
            <span style={{ opacity: 0.9 }}>📘 Flashcards</span>
          </div>

          <button
            type="button"
            className={`flashcard flashcard--single ${
              phase === "out" ? "flashcard--out" : phase === "in" ? "flashcard--in" : ""
            } ${flipped ? "flashcard--flipped" : ""}`}
            onClick={() => setFlipped((v) => !v)}
            aria-label="Flip flashcard"
          >
            <div className="flashcardHeader">
              <span className="flashcardBadge">Flash Card</span>
              <span className="flashcardSide">{flipped ? "Answer" : "Question"}</span>
            </div>

            <div className="flashcardBody">
              <div className="flashcardBubble">
                {flipped ? current.back : current.front}
              </div>
            </div>

            <div className="flashcardFooter">
              <span className="flashcardHint">
                {flipped ? "Click to see question" : "Click to reveal answer"}
              </span>
            </div>
          </button>

          <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.85rem" }}>
            <button type="button" onClick={prev} disabled={index === 0 || phase !== "idle"}>
              Previous
            </button>
            <button
              type="button"
              onClick={next}
              disabled={index === cards.length - 1 || phase !== "idle"}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

