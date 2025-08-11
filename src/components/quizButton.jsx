import React, { useState } from "react";
import QuizInterface from "./QuizInterface"; 

function QuizButton({ notes }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();

      if (response.ok) {
        const quizData = data.quiz;
        setQuiz(quizData);

        
        const userId = localStorage.getItem("userId");
        if (userId) {
          await fetch("http://localhost:5000/update-streak", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          });
        } else {
          console.warn("User not logged in – skipping streak update.");
        }

      } else {
        setError(data.error || "Failed to generate quiz");
      }
    } catch (err) {
      setError("Network error or server is down.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div>
      {!quiz && (
        <button
          onClick={handleClick}
          
          className="take-quiz-button"
        >
          {loading ? "Generating..." : "Take Quiz"}
        </button>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {quiz && <QuizInterface quiz={quiz} />}
    </div>
  );
}

export default QuizButton;
