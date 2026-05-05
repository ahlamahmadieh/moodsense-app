require("dotenv").config();
const nodemailer = require("nodemailer");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "moodsense",
  password: "123456",
  port: 5432,
});
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get("/", (req, res) => {
  res.send("MoodSense backend is running ✅");
});

app.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, name, phone, password) VALUES ($1, $2, $3, $4) RETURNING email, name, phone, usual_sleep, activity_level, work_type, energy_source, main_stressor, created_at",
      [email, name, phone, hashedPassword]
    );

    const newUser = result.rows[0];


await transporter.sendMail({
  from: `"MoodSense 🌤️" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Welcome to MoodSense 🌤️",
  html: `
    <h2>Welcome to MoodSense 🌤️</h2>
    <p>Hi ${name},</p>
    <p>We're happy to have you on board!</p>
    <p>You can now track your mood, improve your habits, and get personalized AI insights.</p>
    <br/>
    <p>Stay positive 💛</p>
    <p><b>MoodSense Team</b></p>
  `,
});

res.json({
  message: "User created successfully ✅",
  user: newUser,
});
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }

    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    delete user.password;

    res.json({
      message: "Login successful ✅",
      user,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/profile", async (req, res) => {
  const {
    email,
    usualSleep,
    activityLevel,
    workType,
    energySource,
    mainStressor,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET usual_sleep = $1,
           activity_level = $2,
           work_type = $3,
           energy_source = $4,
           main_stressor = $5
       WHERE email = $6
       RETURNING email, name, phone, usual_sleep, activity_level, work_type, energy_source, main_stressor, created_at`,
      [usualSleep, activityLevel, workType, energySource, mainStressor, email]
    );

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ error: "Profile update failed" });
  }
});

app.post("/entries", async (req, res) => {
  const { userEmail, mood, sleepHours, sleepQuality, stressLevel, notes } =
    req.body;

  try {
    const result = await pool.query(
      "INSERT INTO entries (user_email, mood, sleep_hours, sleep_quality, stress_level, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [userEmail, mood, sleepHours, sleepQuality, stressLevel, notes]
    );

    res.json({
      message: "Saved to database ✅",
      entry: result.rows[0],
    });
  } catch (err) {
    console.error("ENTRY SAVE ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/entries", async (req, res) => {
  const { userEmail } = req.query;

  try {
    const result = await pool.query(
      "SELECT * FROM entries WHERE user_email = $1 ORDER BY id DESC",
      [userEmail]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET ENTRIES ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/entries/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM entries WHERE id = $1", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

app.post("/ai-chat", async (req, res) => {
  const { question, userEmail } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT email, name, usual_sleep, activity_level, work_type, energy_source, main_stressor FROM users WHERE email = $1",
      [userEmail]
    );

    const userProfile = userResult.rows[0];

    const entriesResult = await pool.query(
      "SELECT * FROM entries WHERE user_email = $1 ORDER BY id DESC LIMIT 1",
      [userEmail]
    );

    const latest = entriesResult.rows[0];

    const profileContext = userProfile
      ? `User profile:
Name: ${userProfile.name}
Usual sleep hours: ${userProfile.usual_sleep || "Not provided"}
Daily activity level: ${userProfile.activity_level || "Not provided"}
Work/study type: ${userProfile.work_type || "Not provided"}
Preferred energy recovery method: ${userProfile.energy_source || "Not provided"}
Main stressor: ${userProfile.main_stressor || "Not provided"}`
      : "No user profile data is available.";

    const latestContext = latest
      ? `Latest wellness check-in:
Mood: ${latest.mood}/5
Sleep hours: ${latest.sleep_hours}
Sleep quality: ${latest.sleep_quality}/5
Stress level: ${latest.stress_level}/5
Notes: ${latest.notes || "No notes"}`
      : "No wellness check-in data is available yet.";

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "You are MoodSense AI, a friendly wellness chatbot. Reply naturally to the user's exact message. Use the user's profile and latest wellness check-in only when relevant. Do not assume that low sleep affects every user the same way; compare today's data with the user's usual baseline. Do not diagnose medical conditions. Do not replace a doctor or therapist. Keep replies short, practical, and conversational.",
            },
            {
              role: "user",
              content: `${profileContext}\n\n${latestContext}\n\nUser message: ${question}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("GROQ ERROR:", data);
      return res.status(500).json({ error: "AI assistant error" });
    }

    const answer =
      data?.choices?.[0]?.message?.content ||
      "I could not generate a response right now.";

    res.json({ answer });
  } catch (err) {
    console.error("AI CHAT ERROR:", err);
    res.status(500).json({ error: "AI assistant error" });
  }
});

app.post("/daily-insight", async (req, res) => {
  const { userEmail } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT name, usual_sleep, activity_level, work_type, energy_source, main_stressor FROM users WHERE email = $1",
      [userEmail]
    );

    const entriesResult = await pool.query(
      "SELECT * FROM entries WHERE user_email = $1 ORDER BY id DESC LIMIT 3",
      [userEmail]
    );

    const user = userResult.rows[0];
    const entries = entriesResult.rows;

    if (!entries.length) {
      return res.json({
        insight:
          "Start with your first check-in today so MoodSense can understand your mood, sleep, and stress patterns.",
      });
    }

    const context = `
User profile:
Name: ${user?.name || "User"}
Usual sleep: ${user?.usual_sleep || "Not provided"}
Activity level: ${user?.activity_level || "Not provided"}
Work type: ${user?.work_type || "Not provided"}
Energy source: ${user?.energy_source || "Not provided"}
Main stressor: ${user?.main_stressor || "Not provided"}

Recent check-ins:
${entries
  .map(
    (e, i) =>
      `${i + 1}. Mood: ${e.mood}/5, Sleep: ${e.sleep_hours}h, Sleep quality: ${
        e.sleep_quality
      }/5, Stress: ${e.stress_level}/5, Notes: ${e.notes || "No notes"}`
  )
  .join("\n")}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "You are MoodSense AI. Write one short daily wellness recommendation based on the user's profile and recent check-ins. Do not diagnose. Do not be dramatic. Keep it under 45 words.",
            },
            {
              role: "user",
              content: context,
            },
          ],
          temperature: 0.7,
          max_tokens: 100,
        }),
      }
    );

    const data = await response.json();

    const insight =
      data?.choices?.[0]?.message?.content ||
      "Track your mood honestly, drink water, and take one short break today.";

    res.json({ insight });
  } catch (err) {
    console.error("DAILY INSIGHT ERROR:", err);
    res.json({
      insight:
        "Track your mood honestly, drink water, and take one short break today.",
    });
  }
});
app.post("/pattern-analysis", async (req, res) => {
  const { userEmail } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT usual_sleep FROM users WHERE email = $1",
      [userEmail]
    );

    const entriesResult = await pool.query(
      "SELECT * FROM entries WHERE user_email = $1 ORDER BY id DESC LIMIT 10",
      [userEmail]
    );

    const user = userResult.rows[0];
    const entries = entriesResult.rows;

    if (!entries.length) {
      return res.json({
        insight: "Start logging your days so we can detect patterns.",
      });
    }

    const context = `
User usual sleep: ${user?.usual_sleep || "Unknown"}

Recent entries:
${entries
  .map(
    (e, i) =>
      `${i + 1}. Mood: ${e.mood}/5, Sleep: ${e.sleep_hours}, Quality: ${
        e.sleep_quality
      }, Stress: ${e.stress_level}`
  )
  .join("\n")}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "Analyze patterns in user behavior. Give one short insight about how sleep, mood, and stress are related. Be specific. No diagnosis. Max 40 words.",
            },
            {
              role: "user",
              content: context,
            },
          ],
          temperature: 0.7,
          max_tokens: 100,
        }),
      }
    );

    const data = await response.json();

    const insight =
      data?.choices?.[0]?.message?.content ||
      "Keep tracking your data to discover patterns.";

    res.json({ insight });
  } catch (err) {
    console.error("PATTERN ERROR:", err);
    res.json({
      insight: "Keep tracking your data to discover patterns.",
    });
  }
});
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:5000");
});