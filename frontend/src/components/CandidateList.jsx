import { useState } from "react";

export default function CandidateList({ candidates, onDelete, onAdd }) {
  const [search, setSearch] = useState("");

  const filtered = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="list-header">
        <div>
          <h2 className="card-title">👥 All Candidates</h2>
          <p className="card-sub">{candidates.length} candidates in database</p>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>
          ➕ Add New
        </button>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search by name, skill, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <p>No candidates found. Add some!</p>
        </div>
      ) : (
        <div className="candidate-grid">
          {filtered.map((c) => (
            <div key={c._id} className="candidate-card">
              <div className="candidate-header">
                <div className="avatar">{c.name[0].toUpperCase()}</div>
                <div>
                  <div className="candidate-name">{c.name}</div>
                  <div className="candidate-email">{c.email}</div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => onDelete(c._id)}
                  title="Delete candidate"
                >
                  🗑️
                </button>
              </div>

              <div className="exp-badge">
                🕐 {c.experience} year{c.experience !== 1 ? "s" : ""} experience
              </div>

              <div className="skills-wrap">
                {c.skills.map((s) => (
                  <span key={s} className="skill-chip">{s}</span>
                ))}
              </div>

              {c.bio && <p className="candidate-bio">{c.bio}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
