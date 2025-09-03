import React, { useState } from "react";
import QuizInterface from "./QuizInterface";

function QuizButton({ notes }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, message: "" });
  const [error, setError] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError("");
    setProgress({ percent: 0, message: "Starting quiz generation..." });

    const eventSource = new EventSource("http://localhost:5000/generate-quiz-stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("SSE event:", data);

        if (data.status === "progress") {
          setProgress({ percent: data.percent, message: data.message });
        } else if (data.status === "done") {
          setQuiz(data.quiz);
          setLoading(false);
          eventSource.close();

          // ✅ update streak if user logged in
          const userId = localStorage.getItem("userId");
          if (userId) {
            fetch("http://localhost:5000/update-streak", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId }),
            });
          }
        }
      } catch (err) {
        console.error("SSE parse error:", err);
        setError("Error processing quiz data.");
        setLoading(false);
        eventSource.close();
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      setError("Failed to connect to server.");
      setLoading(false);
      eventSource.close();
    };
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

      {loading && (
        <p>
          {progress.percent}% - {progress.message}
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {quiz && <QuizInterface quiz={quiz} />}
    </div>
  );
}

export default QuizButton;
