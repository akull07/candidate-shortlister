import { useState } from "react";

export default function JobMatch({ onMatch, onAI, loading, hasResults }) {
  const [form, setForm] = useState({
    requiredSkills: "",
    minExperience: "",
  });

  function handle(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function getJobData() {
    return {
      requiredSkills: form.requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      minExperience: Number(form.minExperience) || 0,
    };
  }

  function handleMatch() {
    if (!form.requiredSkills) return alert("Please enter required skills!");
    onMatch(getJobData());
  }

  function handleAI() {
    if (!form.requiredSkills) return alert("Please enter required skills first!");
    onAI(getJobData());
  }

  return (
    <div className="card">
      <h2 className="card-title">🎯 Job Requirement Matching</h2>
      <p className="card-sub">Enter job requirements to find the best candidates</p>

      <div className="form">
        <div className="form-group full">
          <label className="label">
            Required Skills * <span className="hint">(separate with commas)</span>
          </label>
          <input
            className="input"
            name="requiredSkills"
            value={form.requiredSkills}
            onChange={handle}
            placeholder="e.g. React, Node.js, MongoDB"
          />
          {form.requiredSkills && (
            <div className="skill-preview">
              {form.requiredSkills.split(",").map((s, i) =>
                s.trim() ? (
                  <span key={i} className="skill-chip skill-required">
                    {s.trim()}
                  </span>
                ) : null
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="label">Minimum Experience (Years)</label>
          <input
            className="input"
            name="minExperience"
            type="number"
            min="0"
            value={form.minExperience}
            onChange={handle}
            placeholder="e.g. 1"
          />
        </div>

        <div className="btn-row">
          <button
            className="btn btn-primary"
            onClick={handleMatch}
            disabled={loading}
          >
            {loading ? "⏳ Matching..." : "🔍 Find Matches"}
          </button>

          <button
            className="btn btn-ai"
            onClick={handleAI}
            disabled={loading || !hasResults}
            title={!hasResults ? "Run basic match first" : ""}
          >
            {loading ? "⏳ Analyzing..." : "🤖 AI Analysis"}
          </button>
        </div>

        {!hasResults && (
          <p className="hint-text">
            💡 Run "Find Matches" first, then use "AI Analysis" for intelligent ranking
          </p>
        )}
      </div>

      {/* How it works */}
      <div className="info-box">
        <h3>📌 How Matching Works</h3>
        <ul>
          <li>🟢 <strong>High Match (70%+)</strong> — Most skills match + experience met</li>
          <li>🟡 <strong>Partial Match (40–69%)</strong> — Some skills match</li>
          <li>🔴 <strong>Low Match (below 40%)</strong> — Few or no skills match</li>
          <li>🤖 <strong>AI Analysis</strong> — Uses OpenRouter AI for intelligent ranking</li>
        </ul>
      </div>
    </div>
  );
}
