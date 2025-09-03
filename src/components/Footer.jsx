import React from "react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer style={{ textAlign: "center", padding: "10px 0", marginTop: "20px" }}>
      <p>Copyright ⓒ {year} NoteWise</p>
    </footer>
  );
};

export default Footer;
