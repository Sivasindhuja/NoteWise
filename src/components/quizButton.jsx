import React from "react";

function QuizButton() {
  return (
    <button
      className="take-quiz-button"
      style={{
        padding: "10px 20px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#f5ba13",
        color: "white",
        cursor: "pointer",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        transition: "transform 0.2s"
      }}
      onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
      onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
    >
      Take Quiz
    </button>
  );
}

export default QuizButton;
