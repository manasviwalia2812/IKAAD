import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { askQuestion, summarizeDocuments } from "../api/api";

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState("intermediate");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const handleSummarize = async () => {
    const confirmed = window.confirm(
      "I'll summarize all uploaded documents. This may take a moment. Proceed?"
    );
    if (!confirmed) return;
    setSummary(null);
    setSummaryError(null);
    setSummaryLoading(true);
    try {
      const response = await summarizeDocuments();
      if (response?.status === "success" && response?.data) {
        setSummary(response.data);
      } else {
        setSummaryError("No summary returned.");
      }
    } catch (err) {
      setSummaryError(
        err.response?.data?.detail || err.message || "Failed to summarize."
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const response = await askQuestion(trimmed, level);
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
    <div>
      <h2 style={{ margin: "0 0 6px" }}>Chat</h2>
      <p style={{ color: "var(--muted)", margin: "0 0 14px", fontSize: "0.95rem" }}>
        Ask questions based on your uploaded material.
      </p>

      {/* Summarize section */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={handleSummarize}
          disabled={summaryLoading}
          style={{ marginBottom: "0.5rem" }}
        >
          {summaryLoading ? "Summarizing…" : "Summarize all documents"}
        </button>
        {summaryError && (
          <p style={{ color: "#e74c3c", margin: "0.5rem 0 0", fontSize: "0.9em" }}>
            {summaryError}
          </p>
        )}
        {summary && !summaryError && (
          <details open style={{ marginTop: "0.5rem" }}>
            <summary style={{ cursor: "pointer", fontWeight: 500 }}>
              Summary {summary.chunks_used != null && `(${summary.chunks_used} chunks)`}
            </summary>
            <div
              style={{
                marginTop: "0.5rem",
                padding: "0.75rem",
                borderRadius: 8,
                border: "1px solid var(--border)",
                backgroundColor: "var(--chat-bg)",
                whiteSpace: "pre-wrap",
                fontSize: "0.95em",
              }}
            >
              {summary.summary}
            </div>
          </details>
        )}
      </div>

      {/* Message list */}
      <div
        style={{
          minHeight: 280,
          maxHeight: 420,
          overflowY: "auto",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "1rem",
          marginBottom: "1rem",
          backgroundColor: "var(--chat-bg)",
        }}
      >
        {messages.length === 0 && !loading ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>
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
                    fontSize: "0.95rem",
                    lineHeight: 1.5,
                  }}
                >
                  {msg.role === "assistant" && !msg.error ? (
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => (
                          <p style={{ margin: "0 0 0.5rem" }} {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            style={{
                              paddingLeft: "1.25rem",
                              margin: "0 0 0.5rem",
                            }}
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            style={{
                              paddingLeft: "1.25rem",
                              margin: "0 0 0.5rem",
                            }}
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li style={{ marginBottom: "0.25rem" }} {...props} />
                        ),
                        h1: ({ node, ...props }) => (
                          <h3
                            style={{
                              margin: "0 0 0.5rem",
                              fontSize: "1.1rem",
                            }}
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h4
                            style={{
                              margin: "0.35rem 0 0.35rem",
                              fontSize: "1rem",
                            }}
                            {...props}
                          />
                        ),
                        code: ({ inline, ...props }) =>
                          inline ? (
                            <code
                              style={{
                                backgroundColor: "rgba(0,0,0,0.15)",
                                padding: "0.05rem 0.25rem",
                                borderRadius: 4,
                                fontSize: "0.9em",
                              }}
                              {...props}
                            />
                          ) : (
                            <pre
                              style={{
                                backgroundColor: "rgba(0,0,0,0.25)",
                                padding: "0.5rem 0.75rem",
                                borderRadius: 8,
                                overflowX: "auto",
                                margin: "0.5rem 0",
                              }}
                            >
                              <code {...props} />
                            </pre>
                          ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <div>{msg.content}</div>
                  )}
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
                    color: "var(--muted)",
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
      <div style={{ marginBottom: "0.5rem" }}>
        <label style={{ marginRight: "0.5rem", fontSize: "0.9em" }}>Explain at:</label>
        <select
          className="select"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          style={{
            maxWidth: "200px",
            padding: "0.35rem 0.75rem",
            fontSize: "0.9em",
          }}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
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
            border: "1px solid var(--border)",
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
