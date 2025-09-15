import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HighlightIcon from "@material-ui/icons/Highlight";
import axios from "axios";
import ProfilePictureUpload from "./ProfilePicUpload";

const Header = ({ isLoggedIn, onLogout }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [hovering, setHovering] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/get-profile-picture/${userId}`
        );
        if (res.data?.imageBase64) {
          setProfilePic(res.data.imageBase64);
        }
      } catch (err) {
        console.error("Error fetching profile picture", err);
      }
    };
    if (userId) fetchProfilePic();
  }, [userId]);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/delete-profile-picture/${userId}`);
      setProfilePic(null);
    } catch (err) {
      console.error("Error deleting profile picture", err);
    }
  };

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

        <div
          className="profile-pic-wrapper"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{ position: "relative" }}
        >
          {profilePic ? (
            <>
              <img
                src={profilePic}
                alt="profile"
                className="profile-pic"
                style={{ width: 50, height: 50, borderRadius: "50%" }}
              />
              {hovering && (
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  display: "flex",
                  gap: "4px"
                }}>
                  <ProfilePictureUpload
                    onUpload={(pic) => setProfilePic(pic)}
                    showAsIcon={true}
                  />
                  <button
                    onClick={handleDelete}
                    style={{
                      border: "none",
                      background: "#fff",
                      borderRadius: "50%",
                      cursor: "pointer"
                    }}
                    title="Delete profile picture"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </>
          ) : (
            <ProfilePictureUpload onUpload={(pic) => setProfilePic(pic)} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
