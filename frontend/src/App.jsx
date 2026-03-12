import { useEffect, useMemo, useState } from "react";
import UploadPage from "./pages/UploadPage";
import ChatPage from "./pages/ChatPage";
import { Mascot } from "./components/Mascot";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { QuizPanel } from "./components/QuizPanel";
import { FlashcardsPanel } from "./components/FlashcardsPanel";

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("ikaad_theme") || "neon";
  });
  const [activeTool, setActiveTool] = useState("chat"); // "chat" | "quiz" | "flashcards"

  useEffect(() => {
    localStorage.setItem("ikaad_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const subtitle = useMemo(
    () => "Upload. Summarize. Ask. Practice. Repeat.",
    []
  );

  return (
    <div className="appRoot">
      <header className="topBar">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <div>
            <div className="brandTitle">IKAAD</div>
            <div className="brandSubtitle">{subtitle}</div>
          </div>
        </div>
        <div className="topActions">
          <ThemeSwitcher theme={theme} onChange={setTheme} />
          <a className="pillLink" href="#workspace">
            Get started
          </a>
        </div>
      </header>

      <main className="mainGrid">
        <section className="hero">
          <div className="heroInner">
            <div className="heroKicker">Study assistant</div>
            <h1 className="heroTitle">
              Learn faster with a source‑grounded AI you can trust.
            </h1>
            <p className="heroText">
              Upload your PDFs, PPTs, and DOCX files. Get summaries, ask doubts,
              and practice with confidence—without hallucinations.
            </p>
            <div className="heroCtas">
              <a className="btnPrimary" href="#workspace">
                Start studying
              </a>
              <div className="heroHint">
                Tip: Upload docs first, then chat.
              </div>
            </div>
          </div>
          <Mascot />
        </section>

        <section id="workspace" className="workspace">
          <div className="panel">
            <div className="panelHeader">
              <div>
                <div className="panelTitle">Workspace</div>
                <div className="panelSub">Manage documents, chat, quizzes, and flashcards.</div>
              </div>
            </div>

            <div className="panelGrid">
              <div className="panelCard">
                <UploadPage />
              </div>
              <div className="panelCard">
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
                </div>
                <div style={{ marginTop: "0.65rem" }}>
                  {activeTool === "chat" && <ChatPage />}
                  {activeTool === "quiz" && <QuizPanel />}
                  {activeTool === "flashcards" && <FlashcardsPanel />}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
