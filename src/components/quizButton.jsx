// QuizButton.jsx

import React, { useState } from "react";
import QuizInterface from "./QuizInterface";

const QuizButton = ({ notes }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await response.json();
      console.log("Quiz response:", data);

      // Normalize quiz structure
      let normalizedQuiz;
      if (Array.isArray(data.quiz)) {
        normalizedQuiz = { questions: data.quiz };
      } else if (data.quiz?.questions) {
        normalizedQuiz = data.quiz;
      } else {
        normalizedQuiz = { questions: [] };
      }

      setQuiz(normalizedQuiz);

      // ✅ Update streak if user logged in
      const userId = localStorage.getItem("userId");
      if (userId) {
        fetch("http://localhost:5000/update-streak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
      }
    } catch (err) {
      console.error("Quiz fetch error:", err);
      setError("Error generating quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!quiz && (
        <button
          onClick={handleClick}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {loading ? "Loading quiz..." : "Take Quiz"}
        </button>
      )}

      {loading && <p>Generating your quiz, please wait...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {quiz && <QuizInterface quiz={quiz} />}
    </div>
  );
};

export default QuizButton;
