import { useState } from "react";
import { askQuestion } from "../api/api";

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const response = await askQuestion(trimmed);
      const answer =
        response?.status === "success" && response?.data?.answer
          ? response.data.answer
          : "No answer received.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: answer, sources: response?.data?.sources, confidence: response?.data?.confidence },
      ]);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Could not reach the server. Is the backend running?";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${typeof detail === "string" ? detail : JSON.stringify(detail)}`,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2>Ask Questions</h2>
      <p style={{ color: "var(--color-muted)", marginBottom: "1rem" }}>
        Ask questions based on your uploaded material.
      </p>

      {/* Message list */}
      <div
        style={{
          minHeight: 280,
          maxHeight: 420,
          overflowY: "auto",
          border: "1px solid #333",
          borderRadius: 8,
          padding: "1rem",
          marginBottom: "1rem",
          backgroundColor: "var(--chat-bg)",
        }}
      >
        {messages.length === 0 && !loading ? (
          <p style={{ color: "var(--color-muted)", margin: 0 }}>
            No messages yet. Type a question and press Send.
          </p>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  textAlign: msg.role === "user" ? "right" : "left",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    maxWidth: "85%",
                    padding: "0.5rem 0.75rem",
                    borderRadius: 12,
                    backgroundColor:
                      msg.role === "user"
                        ? "var(--user-bubble)"
                        : "var(--assistant-bubble)",
                    textAlign: "left",
                  }}
                >
                  <div>{msg.content}</div>
                  {msg.role === "assistant" && msg.error && (
                    <div style={{ marginTop: "0.25rem", fontSize: "0.85em", opacity: 0.85 }}>
                      Tip: Ensure the backend is running (e.g. <code>uvicorn app.main:app</code>) and you have uploaded at least one PDF.
                    </div>
                  )}
                  {msg.role === "assistant" && !msg.error && (msg.sources?.length > 0 || typeof msg.confidence === "number") && (
                    <div style={{ marginTop: "0.5rem", fontSize: "0.85em", opacity: 0.9 }}>
                      {typeof msg.confidence === "number" && (
                        <div style={{ marginBottom: "0.25rem" }}>
                          Confidence: {(msg.confidence * 100).toFixed(0)}%
                        </div>
                      )}
                      {msg.sources?.length > 0 && (
                        <details style={{ cursor: "pointer" }}>
                          <summary>Sources</summary>
                          <ul style={{ margin: "0.25rem 0 0 1rem", paddingLeft: "1rem" }}>
                            {msg.sources.map((src, j) => (
                              <li key={j} style={{ wordBreak: "break-word" }}>
                                {typeof src === "string" ? src.slice(0, 200) + (src.length > 200 ? "…" : "") : String(src)}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ textAlign: "left", marginBottom: "0.75rem" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.5rem 0.75rem",
                    borderRadius: 12,
                    backgroundColor: "var(--assistant-bubble)",
                    color: "var(--color-muted)",
                  }}
                >
                  Thinking…
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          style={{
            flex: 1,
            padding: "0.6rem 0.75rem",
            borderRadius: 8,
            border: "1px solid #333",
            fontSize: "1rem",
            backgroundColor: "var(--input-bg)",
          }}
        />
        <button type="submit" disabled={!input.trim() || loading}>
          {loading ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}

export default ChatPage;
