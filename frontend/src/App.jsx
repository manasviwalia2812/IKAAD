import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import HomePage from "./pages/HomePage";
import WorkspacePage from "./pages/WorkspacePage";
import AuthPage from "./pages/AuthPage";
import LogoutButton from "./components/LogoutButton";
import { supabase } from "./supabaseClient";

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("ikaad_theme") || "neon";
  });
  const [activeTool, setActiveTool] = useState("chat");
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [groqKey, setGroqKey] = useState(() => {
    return localStorage.getItem("groq_api_key") || "";
  });
  
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("ikaad_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("groq_api_key", groqKey);
  }, [groqKey]);

  useEffect(() => {
    if (location.pathname === "/workspace") {
      setActiveTool("chat");
    }
  }, [location.pathname]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const subtitle = useMemo(() => "Upload. Summarize. Ask. Practice. Repeat.", []);

  if (authLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-main)' }}>Loading Miku...</div>;
  }

  if (!session) {
    return <AuthPage onLoginSuccess={setSession} />;
  }

  const handleLogout = () => {
    setSession(null);
  };
  
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Friend";

  return (
    <div className="appRoot">
      <header className="topBar">
        <Link to="/" className="brand" style={{ textDecoration: "none", color: "inherit", display: "flex", gap: "10px", alignItems: "center" }}>
          <i className="fas fa-robot" style={{ fontSize: "2.2rem", color: "var(--accent)" }}></i>
          <div>
            <div className="brandTitle">IKAAD</div>
            <div className="brandSubtitle">{subtitle}</div>
          </div>
        </Link>
        <div className="topActions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <input 
            type="password" 
            placeholder="Custom Groq API Key"
            value={groqKey}
            onChange={(e) => setGroqKey(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
            title="Leave empty to use the default system key"
          />
          <ThemeSwitcher theme={theme} onChange={setTheme} />
          {location.pathname !== "/workspace" && (
            <Link className="pillLink" to="/workspace">
              Get started
            </Link>
          )}
          <LogoutButton onLogoutSuccess={handleLogout} />
        </div>
      </header>

      <main className="mainGrid mainGrid--full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/workspace"
            element={<WorkspacePage activeTool={activeTool} setActiveTool={setActiveTool} userName={userName} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
