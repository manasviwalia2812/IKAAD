import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import HomePage from "./pages/HomePage";
import WorkspacePage from "./pages/WorkspacePage";

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("ikaad_theme") || "neon";
  });
  const [activeTool, setActiveTool] = useState("chat"); // "chat" | "quiz" | "flashcards"
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("ikaad_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    // Default tool when navigating into workspace
    if (location.pathname === "/workspace") {
      setActiveTool("chat");
    }
  }, [location.pathname]);

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
          <Link className="pillLink" to="/workspace">
            Get started
          </Link>
        </div>
      </header>

      <main className="mainGrid mainGrid--full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/workspace"
            element={<WorkspacePage activeTool={activeTool} setActiveTool={setActiveTool} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
