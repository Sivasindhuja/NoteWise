import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

function Dashboard() {
  const [quizData, setQuizData] = useState([]);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await axios.get("http://localhost:5000/quizzes", {
          params: { userId },
        });

        const formattedData = response.data.map((quiz, index) => ({
          name: `Quiz ${index + 1}`,
          score: quiz.score,
          total: quiz.total_questions
        }));

        setQuizData(formattedData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchQuizData();
  }, []);

  return (
    <div style={{ width: "90%", margin: "auto", padding: "30px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Quiz Performance Dashboard</h2>
      {quizData.length === 0 ? (
        <p style={{ textAlign: "center" }}>No quiz data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={quizData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" fill="#4caf50" name="Correct Answers" />
            <Bar dataKey="total" fill="#2196f3" name="Total Questions" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default Dashboard;
