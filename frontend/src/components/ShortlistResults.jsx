export default function ShortlistResults({ results, aiAnalysis, onGoMatch }) {
  if (results.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">🎯</div>
        <p>No results yet. Go to Job Match tab to find candidates!</p>
        <button className="btn btn-primary" onClick={onGoMatch}>
          Go to Job Match →
        </button>
      </div>
    );
  }

  const colorMap = {
    "High Match":    { bg: "#00e5a015", border: "#00e5a0", text: "#00e5a0" },
    "Partial Match": { bg: "#f5c84215", border: "#f5c842", text: "#f5c842" },
    "Low Match":     { bg: "#ff6b6b15", border: "#ff6b6b", text: "#ff6b6b" },
  };

  return (
    <div>
      <div className="list-header">
        <div>
          <h2 className="card-title">📊 Shortlist Results</h2>
          <p className="card-sub">{results.length} candidates ranked by match score</p>
        </div>
      </div>

      {/* Score summary bar */}
      <div className="score-summary">
        {["High Match", "Partial Match", "Low Match"].map((level) => {
          const count = results.filter((r) => r.matchLevel === level).length;
          const col = colorMap[level];
          return (
            <div key={level} className="score-pill" style={{ background: col.bg, border: `1px solid ${col.border}33` }}>
              <span style={{ color: col.text, fontWeight: 700 }}>{count}</span>
              <span style={{ color: col.text, fontSize: 12 }}>{level}</span>
            </div>
          );
        })}
      </div>

      {/* Candidate Result Cards */}
      <div className="result-list">
        {results.map((c, i) => {
          const col = colorMap[c.matchLevel] || colorMap["Low Match"];
          return (
            <div
              key={c._id}
              className="result-card"
              style={{ borderLeft: `4px solid ${col.border}` }}
            >
              <div className="result-rank">#{i + 1}</div>

              <div className="result-body">
                <div className="result-top">
                  <div className="avatar">{c.name[0].toUpperCase()}</div>
                  <div className="result-info">
                    <div className="candidate-name">{c.name}</div>
                    <div className="candidate-email">{c.email}</div>
                  </div>
                  <div className="result-score-wrap">
                    <div
                      className="result-score"
                      style={{ color: col.text }}
                    >
                      {c.matchScore}%
                    </div>
                    <span
                      className="match-tag"
                      style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}44` }}
                    >
                      {c.matchLevel}
                    </span>
                  </div>
                </div>

                {/* Score bar */}
                <div className="score-bar-wrap">
                  <div className="score-bar">
                    <div
                      className="score-bar-fill"
                      style={{ width: `${c.matchScore}%`, background: col.border }}
                    />
                  </div>
                </div>

                <div className="result-skills">
                  <span className="skills-label">Skills: </span>
                  {c.skills.map((s) => {
                    const isMatched = c.matchedSkills
                      .map((m) => m.toLowerCase())
                      .includes(s.toLowerCase());
                    return (
                      <span
                        key={s}
                        className={`skill-chip ${isMatched ? "skill-matched" : ""}`}
                      >
                        {isMatched ? "✓ " : ""}{s}
                      </span>
                    );
                  })}
                </div>

                <div className="result-meta">
                  <span>🕐 {c.experience} yrs experience</span>
                  <span>✅ {c.matchedSkills.length} skill{c.matchedSkills.length !== 1 ? "s" : ""} matched</span>
                </div>

                {c.bio && <p className="candidate-bio">{c.bio}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <div className="ai-box">
          <h3 className="ai-title">🤖 AI Analysis</h3>
          <pre className="ai-text">{aiAnalysis}</pre>
        </div>
      )}
    </div>
  );
}
