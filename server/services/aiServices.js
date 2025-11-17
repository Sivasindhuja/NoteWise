// server/services/aiService.js
const axios = require("axios");
require("dotenv").config();

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// New function to handle the core AI interaction
exports.generateQuizFromNotes = async (notes, difficulty = "medium") => {
  const formattedNotes = notes
    .map((n, i) => `Note ${i + 1}: ${n.title} - ${n.content}`)
    .join("\n");

  const prompt = `
Based on the following notes, generate 3 multiple-choice quiz questions.
The difficulty level should be: ${difficulty}.
Each question must include 4 options and the single correct answer in a JSON array format.
Notes:
${formattedNotes}
  `;

  try {
    const response = await axios.post(
      API_URL,
      {
        model: "google/gemini-pro-1.5",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        // Add JSON mode parameter if supported by OpenRouter's Gemini implementation
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-referer": "http://localhost:3000",
        },
      }
    );

    let output = response.data.choices[0]?.message?.content || "";
    output = output.replace(/```json|```/g, "").trim();

    // In a real application, you would use a robust JSON parsing library with error handling
    return JSON.parse(output);
  } catch (err) {
    console.error("AI Service: Quiz generation failed:", err?.response?.data || err.message);
    throw new Error("Failed to generate quiz from AI.");
  }
};