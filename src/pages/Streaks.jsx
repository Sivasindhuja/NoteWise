
import React, { useEffect, useState } from "react";
import axios from "axios";

const Streaks = () => {
  const [streaks, setStreaks] = useState({
    current_streak: 0,
    longest_streak: 0,
  });

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    axios
      .get(`http://localhost:5000/get-streak/${userId}`)
      .then((res) => setStreaks(res.data))
      .catch((err) => console.error("Error fetching streaks:", err));
  }, []);

  const isSingleDay=streaks.current_streak===1;
  

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>📈 Your Quiz Streaks</h2>
      
      <p>
        <strong>Current Streak:</strong> 
      {streaks.current_streak} {isSingleDay ? "day":"days"}
      </p>
      <p>
        <strong>Longest Streak:</strong> {streaks.longest_streak} day(s)
      </p>
    </div>
  );
};

export default Streaks;
