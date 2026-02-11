import UploadPage from "./pages/UploadPage";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>IKAAD – Academic Assistant</h1>

      <UploadPage />
      <hr />
      <ChatPage />
    </div>
  );
}

export default App;
