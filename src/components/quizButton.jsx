

// import React from "react";

// function QuizButton({ notes }) {
//   const handleClick = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/generate-quiz", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ notes })
//       });

//       const data = await res.json();
//       console.log("Raw response:", data);

//       if (res.ok) {
//         console.log("Generated Quiz:", data.quiz);
//         // Optionally: set some quiz state to display it
//       } else {
//         console.error("Quiz generation failed:", data.error);
//       }
//     } catch (err) {
//       console.error("Quiz generation error:", err);
//     }
//   };

//   return (
//     <button
//       className="take-quiz-button"
//       onClick={handleClick}
//     >
//       Take Quiz
//     </button>
//   );
// }

// export default QuizButton;
import React, { useState } from "react";
import QuizInterface from "./QuizInterface"; // Make sure path is correct

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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ notes })
      });

      const data = await response.json();
      if (response.ok) {
        setQuiz(data.quiz);
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
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "8px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
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
