const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── Connect to MongoDB Atlas ─────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ─── Candidate Schema & Model ─────────────────────────────────────────────
const CandidateSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  skills:     { type: [String], required: true },
  experience: { type: Number, required: true },
  bio:        { type: String, default: "" },
  createdAt:  { type: Date, default: Date.now },
});

const Candidate = mongoose.model("Candidate", CandidateSchema);

// ─── ROUTES ───────────────────────────────────────────────────────────────

// 1. Add a new candidate
app.post("/api/candidates", async (req, res) => {
  try {
    const { name, email, skills, experience, bio } = req.body;
    const candidate = new Candidate({ name, email, skills, experience, bio });
    await candidate.save();
    res.status(201).json({ message: "Candidate added successfully!", candidate });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. Get all candidates
app.get("/api/candidates", async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Delete a candidate
app.delete("/api/candidates/:id", async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: "Candidate deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Basic shortlist / match candidates
app.post("/api/match", async (req, res) => {
  try {
    const { requiredSkills, minExperience } = req.body;

    if (!requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({ error: "Please provide requiredSkills" });
    }

    const allCandidates = await Candidate.find();

    const scored = allCandidates.map((c) => {
      const reqLower = requiredSkills.map((s) => s.toLowerCase());
      const matchedSkills = c.skills.filter((s) =>
        reqLower.includes(s.toLowerCase())
      );
      const skillScore = matchedSkills.length / requiredSkills.length;
      const expOk = c.experience >= (minExperience || 0);
      const finalScore = expOk ? skillScore : skillScore * 0.5;

      let matchLevel = "Low Match";
      if (finalScore >= 0.7) matchLevel = "High Match";
      else if (finalScore >= 0.4) matchLevel = "Partial Match";

      return {
        _id:          c._id,
        name:         c.name,
        email:        c.email,
        skills:       c.skills,
        experience:   c.experience,
        bio:          c.bio,
        matchedSkills,
        matchScore:   Math.round(finalScore * 100),
        matchLevel,
      };
    });

    // Sort: highest score first
    scored.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ results: scored, total: scored.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. AI-based shortlisting using OpenRouter
app.post("/api/ai/shortlist", async (req, res) => {
  try {
    const { requiredSkills, minExperience, candidates } = req.body;

    if (!candidates || candidates.length === 0) {
      return res.status(400).json({ error: "No candidates provided" });
    }

    const candidateList = candidates
      .map(
        (c, i) =>
          `${i + 1}. ${c.name} | Skills: ${c.skills.join(", ")} | Experience: ${c.experience} years | Bio: ${c.bio || "N/A"}`
      )
      .join("\n");

    const prompt = `You are an expert AI recruitment assistant.

Job Requirements:
- Required Skills: ${requiredSkills.join(", ")}
- Minimum Experience: ${minExperience} years

Candidates:
${candidateList}

Please:
1. Rank all candidates from BEST to WORST fit for this job
2. Give each candidate a suitability score out of 10
3. Explain in 1-2 lines why each candidate is or isn't suitable
4. Clearly mention your TOP PICK with a strong reason

Be practical, concise, and helpful for a recruiter.`;

    const aiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const data = await aiResponse.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const aiText = data.choices?.[0]?.message?.content || "No response from AI";
    res.json({ aiAnalysis: aiText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
