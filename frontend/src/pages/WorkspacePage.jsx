import { useState } from "react";
import UploadPage from "./UploadPage";
import ChatPage from "./ChatPage";
import { QuizPanel } from "../components/QuizPanel";
import { FlashcardsPanel } from "../components/FlashcardsPanel";
import { SamplePaperPanel } from "../components/SamplePaperPanel";

export default function WorkspacePage({ activeTool, setActiveTool }) {
  const [showDocumentsPanel, setShowDocumentsPanel] = useState(true);

  return (
    <section className="workspace workspace--full">
      <div className="panel workspacePanel">
        <div className="panelHeader panelHeader--withToggle">
          <div>
            <div className="panelTitle">Workspace</div>
            <div className="panelSub">
              {showDocumentsPanel
                ? "Upload documents, then study with AI tools."
                : "Full-screen study view. Toggle to show documents."}
            </div>
          </div>
          <button
            type="button"
            className={`toggleDocsBtn ${showDocumentsPanel ? "toggleDocsBtn--on" : ""}`}
            onClick={() => setShowDocumentsPanel((v) => !v)}
            title={showDocumentsPanel ? "Hide documents, full-screen chat" : "Show documents panel"}
            aria-label={showDocumentsPanel ? "Hide documents panel" : "Show documents panel"}
          >
            <span className="toggleDocsBtnIcon" aria-hidden="true">
              {showDocumentsPanel ? "◀" : "▶"}
            </span>
            <span className="toggleDocsBtnLabel">
              {showDocumentsPanel ? "Hide documents" : "Show documents"}
            </span>
          </button>
        </div>

        <div
          className={
            showDocumentsPanel
              ? "panelGrid panelGrid--wide"
              : "panelGrid panelGrid--chatOnly"
          }
        >
          {showDocumentsPanel && (
            <div className="panelCard">
              <UploadPage />
            </div>
          )}
          <div className={`panelCard ${!showDocumentsPanel ? "panelCard--full" : ""}`}>
            <div className="toolTabs">
              <button
                type="button"
                className={`toolTab ${activeTool === "chat" ? "toolTab--active" : ""}`}
                onClick={() => setActiveTool("chat")}
              >
                Chat
              </button>
              <button
                type="button"
                className={`toolTab ${activeTool === "quiz" ? "toolTab--active" : ""}`}
                onClick={() => setActiveTool("quiz")}
              >
                Quiz
              </button>
              <button
                type="button"
                className={`toolTab ${
                  activeTool === "flashcards" ? "toolTab--active" : ""
                }`}
                onClick={() => setActiveTool("flashcards")}
              >
                Flashcards
              </button>
              <button
                type="button"
                className={`toolTab ${
                  activeTool === "samplepaper" ? "toolTab--active" : ""
                }`}
                onClick={() => setActiveTool("samplepaper")}
              >
                Sample Paper
              </button>
            </div>

            <div style={{ marginTop: "0.65rem" }}>
              {activeTool === "chat" && <ChatPage />}
              {activeTool === "quiz" && <QuizPanel />}
              {activeTool === "flashcards" && <FlashcardsPanel />}
              {activeTool === "samplepaper" && <SamplePaperPanel />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

