import React, { useState } from "react";
import axios from "axios";

const ProfilePictureUpload = ({ onUpload, showAsIcon = false }) => {
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;

      try {
        setLoading(true);
        await axios.post("http://localhost:5000/upload-profile-picture", {
          userId,
          imageBase64: base64,
        });
        if (onUpload) onUpload(base64);
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="profile-upload"
      />
      <label htmlFor="profile-upload" style={{ cursor: "pointer" }}>
        {loading ? (
          <span>Uploading...</span>
        ) : showAsIcon ? (
          <span style={{ fontSize: "0.8rem" }}>✏️</span>
        ) : (
          <span>Upload Photo</span>
        )}
      </label>
    </div>
  );
};

export default ProfilePictureUpload;
