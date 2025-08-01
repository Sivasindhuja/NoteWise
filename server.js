const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();


const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate-quiz", async (req, res) => {
  const { notes } = req.body;

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
        max_tokens: 1000,
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
  const { userId, quiz } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO quizzes (user_id, quiz_data) VALUES ($1, $2) RETURNING *",
      [userId, quiz]
    );

    res.json({ message: "Quiz saved", quiz: result.rows[0] });
  } catch (err) {
    console.error("Error saving quiz:", err);
    res.status(500).json({ error: "Failed to save quiz" });
  }
});





const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
