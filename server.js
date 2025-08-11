const express = require("express");
const axios = require("axios");
const cors = require("cors");

require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db"); 
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";



const app = express();

app.use(cors());//cross origin resource sharing
app.use(express.json());

app.post("/generate-quiz", async (req, res) => {
  const {notes} = req.body;

  try {
    const formattedNotes = notes
      .map((n, i) => `Note ${i + 1}: ${n.title} - ${n.content}`)
      .join("\n");

    console.log(formattedNotes);

    const prompt = `
Based on the following notes, generate 3 multiple-choice quiz questions.
Each should include 4 options and the correct answer in JSON format.
Notes:
${formattedNotes}
    `;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-pro-1.5",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,//cost to number of tokens in output>prompt
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-referer": "http://localhost:3000",
        },
      }
    );

    let output = response.data.choices[0]?.message?.content || "";
    output = output.replace(/```json|```/g, "").trim();

    let quiz;
    try {
      quiz = JSON.parse(output);
    } catch (err) {
      console.error("Failed to parse quiz JSON:", err, "\nRaw output:\n", output);
      return res.status(500).json({ error: "Quiz format was invalid" });
    }

    res.json({ quiz });
  } catch (err) {
    console.error("Quiz generation failed:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

app.post("/save-quiz", async (req, res) => {
  const { userId, score, total, quizData } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO quizzes (user_id, score, total, quiz_data, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [userId, score, total, JSON.stringify(quizData)] // stringifying quizData here
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error saving quiz:", error);
    res.status(500).json({ error: "Failed to save quiz" });
  }
});


app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

   
    const newUser = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashedPassword]
    );

    res.json({ message: "User registered", user: newUser.rows[0] });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = userResult.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Login successful", token, userId: user.id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.get("/quizzes", async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM quizzes WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});
const dayjs = require("dayjs");

app.post("/update-streak", async (req, res) => {
  const { userId } = req.body;

  try {
    const today = dayjs().startOf("day");

    const result = await pool.query("SELECT * FROM streaks WHERE user_id = $1", [userId]);

    if (result.rows.length === 0) {
      await pool.query(
        "INSERT INTO streaks (user_id, current_streak, longest_streak, last_quiz_date) VALUES ($1, 1, 1, $2)",
        [userId, today.toDate()]
      );
      return res.json({ current_streak: 1, longest_streak: 1 });
    }

    const { current_streak, longest_streak, last_quiz_date } = result.rows[0];
    const lastDate = dayjs(last_quiz_date);
    let newStreak = current_streak;

    if (today.diff(lastDate, "day") === 1) {
      newStreak += 1;
    } else if (today.diff(lastDate, "day") > 1) {
      newStreak = 1;
    }

    const newLongest = Math.max(longest_streak, newStreak);

    await pool.query(
      "UPDATE streaks SET current_streak = $1, longest_streak = $2, last_quiz_date = $3 WHERE user_id = $4",
      [newStreak, newLongest, today.toDate(), userId]
    );

    res.json({ current_streak: newStreak, longest_streak: newLongest });
  } catch (err) {
    console.error("Streak update error:", err);
    res.status(500).json({ error: "Failed to update streak" });
  }
});

app.get("/get-streak/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query("SELECT * FROM streaks WHERE user_id = $1", [userId]);

    if (result.rows.length === 0) {
      return res.json({ current_streak: 0, longest_streak: 0 });
    }

    const { current_streak, longest_streak } = result.rows[0];
    res.json({ current_streak, longest_streak });
  } catch (err) {
    console.error("Fetch streak error:", err);
    res.status(500).json({ error: "Failed to fetch streaks" });
  }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
