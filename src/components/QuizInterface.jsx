// QuizInterface.jsx

import React, { useEffect, useState } from "react";

const QuizInterface = ({ quiz }) => {
  console.log("Loaded quiz:", quiz);

  const questions = Array.isArray(quiz) ? quiz : quiz?.questions || [];

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [quizSaved, setQuizSaved] = useState(false);

  const handleAnswer = (qIndex, selectedOption) => {
    if (selectedAnswers[qIndex] !== undefined) return; // Already answered

    const isCorrect =
      String(selectedOption).trim().toLowerCase() ===
      String(questions[qIndex].answer).trim().toLowerCase();

    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: selectedOption,
    }));

    setCorrectAnswers((prev) => ({
      ...prev,
      [qIndex]: isCorrect,
    }));

    console.log(
      `Q${qIndex + 1}: Selected "${selectedOption}", Correct is "${questions[qIndex].answer}" →`,
      isCorrect,
    );
  };

  const score = Object.values(correctAnswers).filter(Boolean).length;

  useEffect(() => {
    if (questions.length === 0) return;

    const allAnswered = Object.keys(selectedAnswers).length === questions.length;
    const userId = localStorage.getItem("userId");

    if (allAnswered && !quizSaved && userId) {
      const calculatedScore = score;

      fetch("http://localhost:5000/save-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          score: calculatedScore,
          total: questions.length,
          quizData: questions, // ✅ Only save questions array
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("✅ Quiz saved to DB:", data);
          setQuizSaved(true);
        })
        .catch((err) => {
          console.error("❌ Failed to save quiz:", err);
        });
    }
  }, [selectedAnswers, correctAnswers, questions, quizSaved, score]);

  return (
    <div style={{ padding: "20px" }}>
      {/* Floating Scoreboard */}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          fontWeight: "bold",
          fontSize: "18px",
          background: "#fff",
          padding: "8px 12px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        Score: {score} / {questions.length}
      </div>

      {/* Render each question */}
      {questions.map((q, index) => {
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
                else if (isCorrect) background = "#dff0ff"; // highlight correct
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
                  <span style={{ color: "green" }}>✅ Correct!</span>
                ) : (
                  <span style={{ color: "red" }}>
                    ❌ Incorrect. Correct answer: <strong>{q.answer}</strong>
                  </span>
                )}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QuizInterface;
