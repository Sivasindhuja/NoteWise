import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function QuizInterface({ quiz }) {
  console.log("Loaded quiz:", quiz);
  
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [quizSaved, setQuizSaved] = useState(false);

  const handleAnswer = (qIndex, selectedOption) => {
    if (selectedAnswers[qIndex] !== undefined) return;

    const isCorrect =
      String(selectedOption).trim().toLowerCase() ===
      String(quiz[qIndex].answer).trim().toLowerCase();

    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: selectedOption,
    }));

    setCorrectAnswers((prev) => ({
      ...prev,
      [qIndex]: isCorrect,
    }));

    console.log(`Q${qIndex + 1}: Selected "${selectedOption}", Correct is "${quiz[qIndex].answer}" →`, isCorrect);
  };

  const score = Object.values(correctAnswers).filter(Boolean).length;

  useEffect(() => {
    const allAnswered = Object.keys(selectedAnswers).length === quiz.length;
    const userId = localStorage.getItem("userId");

    if (allAnswered && !quizSaved && userId) {
      const calculatedScore = Object.values(correctAnswers).filter(Boolean).length;

      fetch("http://localhost:5000/save-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          score: calculatedScore,
          total: quiz.length,
          quizData: quiz,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(" Quiz saved to DB:", data);
          setQuizSaved(true);
        })
        .catch((err) => {
          console.error("Failed to save quiz:", err);
        });
    }
  }, [selectedAnswers, correctAnswers, quiz.length, quizSaved, quiz]);

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          fontWeight: "bold",
          fontSize: "18px",
        }}
      >
        Score: {score} / {quiz.length}
      </div>

      {quiz.map((q, index) => {
        const wasAnswered = selectedAnswers[index] !== undefined;

        return (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "20px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <p style={{ fontWeight: "bold", marginBottom: "12px" }}>
              {index + 1}. {q.question}
            </p>

            {q.options.map((option, optIndex) => {
              const isSelected = selectedAnswers[index] === option;
              const isCorrect =
                String(option).trim().toLowerCase() ===
                String(q.answer).trim().toLowerCase();

              let background = "#fff";
              if (wasAnswered) {
                if (isSelected && isCorrect) background = "#c8f7c5"; // green
                else if (isSelected && !isCorrect) background = "#f7c5c5"; // red
                else if (isCorrect) background = "#dff0ff"; // blue
              }

              return (
                <button
                  key={optIndex}
                  onClick={() => handleAnswer(index, option)}
                  disabled={wasAnswered}
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    padding: "10px",
                    width: "100%",
                    textAlign: "left",
                    borderRadius: "6px",
                    backgroundColor: background,
                    border: "1px solid #ccc",
                    cursor: wasAnswered ? "default" : "pointer",
                  }}
                >
                  {option}
                </button>
              );
            })}

            {wasAnswered && (
              <p style={{ marginTop: "8px", fontWeight: "500" }}>
                {correctAnswers[index] ? (
                  <span style={{ color: "green" }}>Correct!</span>
                ) : (
                  <span style={{ color: "red" }}>
                    Incorrect. Correct answer:{" "}
                    <strong>{q.answer}</strong>
                  </span>
                )}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default QuizInterface;
