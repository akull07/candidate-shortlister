import { useState, useEffect } from "react";
import AddCandidate from "./components/AddCandidate";
import CandidateList from "./components/CandidateList";
import JobMatch from "./components/JobMatch";
import ShortlistResults from "./components/ShortlistResults";
import "./App.css";

const API = "http://localhost:5000/api";

export default function App() {
  const [tab, setTab] = useState("candidates");
  const [candidates, setCandidates] = useState([]);
  const [shortlistResults, setShortlistResults] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all candidates on load
  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    try {
      const res = await fetch(`${API}/candidates`);
      const data = await res.json();
      setCandidates(data);
    } catch {
      console.error("Failed to fetch candidates");
    }
  }

  async function addCandidate(formData) {
    try {
      const res = await fetch(`${API}/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.error) return alert("❌ Error: " + data.error);
      alert("✅ Candidate added successfully!");
      fetchCandidates();
      setTab("candidates");
    } catch {
      alert("❌ Server error. Is backend running?");
    }
  }

  async function deleteCandidate(id) {
    if (!window.confirm("Delete this candidate?")) return;
    await fetch(`${API}/candidates/${id}`, { method: "DELETE" });
    fetchCandidates();
  }

  async function matchCandidates(jobData) {
    setLoading(true);
    setAiAnalysis("");
    try {
      const res = await fetch(`${API}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });
      const data = await res.json();
      if (data.error) return alert("❌ " + data.error);
      setShortlistResults(data.results);
      setTab("shortlist");
    } catch {
      alert("❌ Server error. Is backend running?");
    }
    setLoading(false);
  }

  async function getAIAnalysis(jobData) {
    if (shortlistResults.length === 0) {
      return alert("Please run basic match first!");
    }
    setLoading(true);
    setAiAnalysis("");
    try {
      const res = await fetch(`${API}/ai/shortlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...jobData,
          candidates: shortlistResults,
        }),
      });
      const data = await res.json();
      if (data.error) return alert("❌ AI Error: " + data.error);
      setAiAnalysis(data.aiAnalysis);
    } catch {
      alert("❌ AI request failed.");
    }
    setLoading(false);
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">TalentAI</span>
            <span className="logo-sub">Shortlister</span>
          </div>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-num">{candidates.length}</span>
              <span className="stat-label">Candidates</span>
            </div>
            <div className="stat">
              <span className="stat-num">{shortlistResults.length}</span>
              <span className="stat-label">Matched</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="tabs">
        {[
          { id: "candidates", label: "👥 All Candidates" },
          { id: "add",        label: "➕ Add Candidate" },
          { id: "match",      label: "🎯 Job Match" },
          { id: "shortlist",  label: "📊 Results" },
        ].map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id === "shortlist" && shortlistResults.length > 0 && (
              <span className="badge">{shortlistResults.length}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="main">
        {loading && (
          <div className="loading-bar">
            <div className="loading-fill" />
          </div>
        )}

        {tab === "candidates" && (
          <CandidateList
            candidates={candidates}
            onDelete={deleteCandidate}
            onAdd={() => setTab("add")}
          />
        )}
        {tab === "add" && <AddCandidate onSubmit={addCandidate} />}
        {tab === "match" && (
          <JobMatch
            onMatch={matchCandidates}
            onAI={getAIAnalysis}
            loading={loading}
            hasResults={shortlistResults.length > 0}
          />
        )}
        {tab === "shortlist" && (
          <ShortlistResults
            results={shortlistResults}
            aiAnalysis={aiAnalysis}
            onGoMatch={() => setTab("match")}
          />
        )}
      </main>
    </div>
  );
}
