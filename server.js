// =====================
// Imports
// =====================
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
require("dotenv").config();

const pool = require("./db");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// =====================
// App Setup
// =====================
const app = express();
app.use(cors()); // Cross Origin Resource Sharing
// app.use(express.json());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// =====================
// Routes
// =====================

// Generate Quiz
app.post("/generate-quiz", async (req, res) => {
  const { notes } = req.body;

  try {
    const formattedNotes = notes
      .map((n, i) => `Note ${i + 1}: ${n.title} - ${n.content}`)
      .join("\n");

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
        max_tokens: 1000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
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

// Save Quiz
app.post("/save-quiz", async (req, res) => {
  const { userId, score, total, quizData } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO quizzes (user_id, score, total, quiz_data, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [userId, score, total, JSON.stringify(quizData)]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error saving quiz:", error);
    res.status(500).json({ error: "Failed to save quiz" });
  }
});

// Register
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

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

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = userResult.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ message: "Login successful", token, userId: user.id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch Quizzes
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

// Update Streak
app.post("/update-streak", async (req, res) => {
  const { userId } = req.body;

  try {
    const today = dayjs().startOf("day");
    const result = await pool.query(
      "SELECT * FROM streaks WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      await pool.query(
        `INSERT INTO streaks (user_id, current_streak, longest_streak, last_quiz_date) 
         VALUES ($1, 1, 1, $2)`,
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
      `UPDATE streaks 
       SET current_streak = $1, longest_streak = $2, last_quiz_date = $3 
       WHERE user_id = $4`,
      [newStreak, newLongest, today.toDate(), userId]
    );

    res.json({ current_streak: newStreak, longest_streak: newLongest });
  } catch (err) {
    console.error("Streak update error:", err);
    res.status(500).json({ error: "Failed to update streak" });
  }
});

// Get Streak
app.get("/get-streak/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM streaks WHERE user_id = $1",
      [userId]
    );

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

//=================
  //profile picture 
//=================

// Upload profile picture
app.post("/upload-profile-picture", async (req, res) => {
  const { userId, imageBase64 } = req.body;

  if (!userId || !imageBase64) {
    return res.status(400).json({ error: "Missing userId or imageBase64" });
  }

  try {
    await pool.query(
      "UPDATE users SET profile_pic = $1 WHERE id = $2",
      [imageBase64, userId]
    );
    res.json({ message: "Profile picture uploaded successfully" });
  } catch (err) {
    console.error("Error uploading your profile picture", err);
    res.status(500).json({ error: "Failed uploading your profile picture" });
  }
});

// Get profile picture
app.get("/get-profile-picture/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      "SELECT profile_pic FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].profile_pic) {
      return res.json({ imageBase64: null });
    }

    res.json({ imageBase64: result.rows[0].profile_pic });
  } catch (err) {
    console.error("Error fetching profile pic:", err);
    res.status(500).json({ error: "Failed to fetch profile picture" });
  }
});


// Delete profile picture
app.delete("/delete-profile-picture/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      "UPDATE users SET profile_pic = NULL WHERE id = $1 RETURNING id",
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile picture deleted successfully" });
  } catch (err) {
    console.error("Error deleting profile picture:", err);
    res.status(500).json({ error: "Failed to delete profile picture" });
  }
});

const { google } = require("googleapis");



// =====================
// Google OAuth Setup
// =====================
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Step A: Redirect user to Google consent screen
app.get("/google/auth", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive.file"
    ],
    prompt: "consent"
  });
  res.redirect(url);
});

// ✅ Step B: Callback after Google login
app.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Redirect back to frontend with access token
    const accessToken = tokens.access_token;
    res.redirect(`http://localhost:3000?googleToken=${accessToken}`);
  } catch (err) {
    console.error("Google callback error:", err);
    res.status(500).send("Google authentication failed");
  }
});



app.post("/export-to-docs", async (req, res) => {
  const { title, content, userId } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT google_tokens, mastered_doc_id FROM users WHERE id = $1",
      [userId]
    );

    if (!userResult.rows[0]?.google_tokens) {
      return res.status(401).json({ error: "Google not connected" });
    }

    oauth2Client.setCredentials(JSON.parse(userResult.rows[0].google_tokens));
    const docs = google.docs({ version: "v1", auth: oauth2Client });

    let documentId = userResult.rows[0].mastered_doc_id;

    if (!documentId) {
      const newDoc = await docs.documents.create({
        requestBody: { title: "NoteWise Mastered Notes" }
      });
      documentId = newDoc.data.documentId;

      await pool.query(
        "UPDATE users SET mastered_doc_id=$1 WHERE id=$2",
        [documentId, userId]
      );
    }

    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              text: `\n\n# ${title}\n${content}`,
              location: { index: 1 }
            }
          }
        ]
      }
    });

    const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;
    res.json({ success: true, docUrl });
  } catch (err) {
    console.error("Error exporting to Google Docs:", err);
    res.status(500).json({ error: "Failed to export note" });
  }
});


app.get("/mastered-notes", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ error: "Invalid token" });

    // Initialize OAuth2 client with just the access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // List top 10 Google Docs
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.document'",
      fields: "files(id, name, createdTime)",
      orderBy: "createdTime desc",
      pageSize: 10,
    });

    res.json(response.data.files || []);
  } catch (err) {
    console.error("Error fetching mastered notes:", err);
    if (err.code === 401 || (err.response && err.response.status === 401)) {
      res.status(401).json({ error: "Unauthorized. Invalid or expired token." });
    } else {
      res.status(500).json({ error: "Failed to load mastered notes" });
    }
  }
});

// =====================
// Server
// =====================

const PORT=5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
