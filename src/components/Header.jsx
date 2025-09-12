import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HighlightIcon from "@material-ui/icons/Highlight";
import ProfilePictureUpload from "./ProfilePicUpload";

const Header = ({ isLoggedIn, onLogout }) => {
  const [profilePic, setProfilePic] = useState(
    localStorage.getItem("profile_picture")
  );

  useEffect(() => {
    const stored = localStorage.getItem("profile_picture");
    if (stored) setProfilePic(stored);
  }, []);

  return (
    <header>
      <div className="navbar">
        <h1 className="logo">
          <HighlightIcon />
          NoteWise
        </h1>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/prev-quizzes">Previous Quizzes</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/streaks">Streaks</Link>
          {isLoggedIn && (
            <button onClick={onLogout} className="logout-button">
              Logout
            </button>
          )}
        </nav>

        <div className="profile-pic-wrapper">
          {profilePic ? (
            <img
              src={profilePic}
              alt="profile"
              className="profile-pic"
            />
          ) : (
            <ProfilePictureUpload onUpload={(pic) => setProfilePic(pic)} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
