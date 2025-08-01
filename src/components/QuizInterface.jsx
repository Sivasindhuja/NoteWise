import React, { useState } from "react";

function QuizInterface({ quiz }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});

  const handleAnswer = (qIndex, selectedOption) => {
    if (selectedAnswers[qIndex] !== undefined) return; 

    const isCorrect = selectedOption === quiz[qIndex].answer;

    setSelectedAnswers(prev => ({
      ...prev,
      [qIndex]: selectedOption
    }));

    setCorrectAnswers(prev => ({
      ...prev,
      [qIndex]: isCorrect
    }));
  };

  const score = Object.values(correctAnswers).filter(Boolean).length;

  return (
    <div style={{ padding: "20px" }}>
      {/* Score Display */}
      <div style={{ position: "fixed", top: 20, right: 20, fontWeight: "bold", fontSize: "18px" }}>
        Score: {score} / {quiz.length}
      </div>

      {/* All Questions */}
      {quiz.map((q, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "20px",
            backgroundColor: "#f9f9f9"
          }}
        >
          <p style={{ fontWeight: "bold", marginBottom: "12px" }}>
            {index + 1}. {q.question}
          </p>

          {/* Options */}
          {q.options.map((option, optIndex) => {
            const isSelected = selectedAnswers[index] === option;
            const isCorrect = q.answer === option;
            const wasAnswered = selectedAnswers[index] !== undefined;

            let background = "#fff";
            if (wasAnswered) {
              if (isSelected && isCorrect) background = "#c8f7c5"; // green
              else if (isSelected && !isCorrect) background = "#f7c5c5"; // red
              else if (isCorrect) background = "#dff0ff"; // blue for correct answer
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

          {/* Feedback */}
          {selectedAnswers[index] !== undefined && (
            <p style={{ marginTop: "8px", fontWeight: "500" }}>
              {correctAnswers[index] ? (
                <span style={{ color: "green" }}> Correct!</span>
              ) : (
                <span style={{ color: "red" }}>
                   Incorrect. Correct answer: <strong>{q.answer}</strong>
                </span>
              )}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default QuizInterface;
