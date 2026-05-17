import { useState } from "react";

export default function AddCandidate({ onSubmit }) {
  const [form, setForm] = useState({
    name: "", email: "", skills: "", experience: "", bio: "",
  });

  function handle(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.skills || !form.experience) {
      return alert("Please fill all required fields!");
    }
    const skillsArray = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
    onSubmit({
      name: form.name,
      email: form.email,
      skills: skillsArray,
      experience: Number(form.experience),
      bio: form.bio,
    });
  }

  return (
    <div className="card">
      <h2 className="card-title">➕ Add New Candidate</h2>
      <p className="card-sub">Fill in the candidate's details below</p>

      <form onSubmit={submit} className="form">
        <div className="form-grid">
          <div className="form-group">
            <label className="label">Full Name *</label>
            <input
              className="input"
              name="name"
              value={form.name}
              onChange={handle}
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div className="form-group">
            <label className="label">Email Address *</label>
            <input
              className="input"
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              placeholder="e.g. rahul@gmail.com"
            />
          </div>

          <div className="form-group full">
            <label className="label">Skills * <span className="hint">(separate with commas)</span></label>
            <input
              className="input"
              name="skills"
              value={form.skills}
              onChange={handle}
              placeholder="e.g. React, Node.js, MongoDB, CSS"
            />
            {form.skills && (
              <div className="skill-preview">
                {form.skills.split(",").map((s, i) =>
                  s.trim() ? <span key={i} className="skill-chip">{s.trim()}</span> : null
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="label">Experience (Years) *</label>
            <input
              className="input"
              name="experience"
              type="number"
              min="0"
              max="50"
              value={form.experience}
              onChange={handle}
              placeholder="e.g. 2"
            />
          </div>

          <div className="form-group full">
            <label className="label">Bio / Projects <span className="hint">(optional)</span></label>
            <textarea
              className="input textarea"
              name="bio"
              value={form.bio}
              onChange={handle}
              placeholder="Brief description of candidate's experience and projects..."
              rows={3}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          ✅ Add Candidate
        </button>
      </form>
    </div>
  );
}
