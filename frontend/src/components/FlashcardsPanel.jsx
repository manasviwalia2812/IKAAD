import { useState } from "react";
import { generateFlashcardsApi } from "../api/api";

export function FlashcardsPanel() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    const trimmed = topic.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    setCards([]);

    try {
      const res = await generateFlashcardsApi(trimmed, 8);
      const newCards = res?.data?.cards || [];
      // Attach local UI state (flipped) per card
      setCards(newCards.map((c) => ({ ...c, flipped: false })));
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

  const toggleCard = (index) => {
    setCards((prev) =>
      prev.map((card, i) =>
        i === index ? { ...card, flipped: !card.flipped } : card
      )
    );
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

      {cards.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.85rem",
          }}
        >
          {cards.map((card, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => toggleCard(idx)}
              className="flashcard"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                  fontSize: "0.8rem",
                  color: "var(--muted)",
                }}
              >
                <span>📘 Flashcard</span>
                <span>{card.flipped ? "Back" : "Front"}</span>
              </div>
              <div
                style={{
                  fontSize: "0.98rem",
                  lineHeight: 1.5,
                  textAlign: "left",
                }}
              >
                {card.flipped ? card.back : card.front}
              </div>
              {!card.flipped && (
                <div
                  style={{
                    marginTop: "0.65rem",
                    fontSize: "0.8rem",
                    color: "var(--muted)",
                  }}
                >
                  Click to reveal answer
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

