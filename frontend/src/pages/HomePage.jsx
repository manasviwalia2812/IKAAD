import { Link } from "react-router-dom";
import { Mascot } from "../components/Mascot";

export default function HomePage() {
  return (
    <section className="hero hero--full">
      <div className="heroInner">
        <div className="heroKicker">Study assistant</div>
        <h1 className="heroTitle">
          Learn faster with a source‑grounded AI you can trust.
        </h1>
        <p className="heroText">
          Upload your PDFs, PPTs, and DOCX files. Get summaries, ask doubts, and
          practice with confidence—without hallucinations.
        </p>
        <div className="heroCtas">
          <Link className="btnPrimary" to="/workspace">
            Start studying
          </Link>
          <div className="heroHint">Tip: Upload docs first, then chat.</div>
        </div>
      </div>
      <Mascot />
    </section>
  );
}

