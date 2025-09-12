import React, { useState } from "react";
import axios from "axios";

const ProfilePictureUpload = ({ onUpload }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // preview for UI
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // upload to backend
    const reader2 = new FileReader();
    reader2.onloadend = async () => {
      const base64 = reader2.result;
      const userId = localStorage.getItem("userId");

      try {
        setLoading(true);
        await axios.post("http://localhost:5000/upload-profile-picture", {
          userId,
          imageBase64: base64,
        });

        localStorage.setItem("profile_picture", base64);
        if (onUpload) onUpload(base64);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader2.readAsDataURL(file);
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
        ) : preview ? (
          <img
            src={preview}
            alt="profile preview"
            style={{ width: 50, height: 50, borderRadius: "50%" }}
          />
        ) : (
          <span>Upload Photo</span>
        )}
      </label>
    </div>
  );
};

export default ProfilePictureUpload;
