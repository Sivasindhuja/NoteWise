import React, { useEffect, useState } from "react";
import axios from "axios";

function ViewQuizzes() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
       const response = await axios.get("http://localhost:5000/quizzes", {
  params: { userId: 1 }
});

        setQuizzes(response.data);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Previous Quizzes</h2>
      {quizzes.length === 0 ? (
        <p>No quizzes found.</p>
      ) : (
        quizzes.map((quizItem, idx) => (
          <div key={idx} style={{ border: "1px solid #ddd", marginBottom: "15px", padding: "10px" }}>
            <h4>Quiz #{idx + 1}</h4>
            {quizItem.quiz_data.map((q, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <strong>Q{i + 1}: {q.question}</strong>
                <ul>
                  {q.options.map((opt, j) => (
                    <li key={j}>{opt}</li>
                  ))}
                </ul>
                <p><em>Answer: {q.answer}</em></p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export default ViewQuizzes;
