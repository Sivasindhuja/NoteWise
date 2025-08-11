import React from "react";
import HighlightIcon from "@material-ui/icons/Highlight";
import { Link } from "react-router-dom"; 

function Header({ onLogout }) {
  return (
    <header>
      <div className="navbar">
        <h1>
          <HighlightIcon />
          NoteWise
        </h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/prev-quizzes">Previous Quizzes</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/streaks">Streaks</Link>
          <button onClick={onLogout} className="logout-button">Logout</button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
