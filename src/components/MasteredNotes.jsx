import React, { useEffect, useState } from "react";

const MasteredNotes = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("googleAccessToken");
    if (!token) {
      alert("Please connect your Google account first.");
      return;
    }

    fetch("http://localhost:5000/mastered-notes", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setNotes(data);
        } else {
          setNotes([]);
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load mastered notes. Please reconnect your Google account.");
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Mastered Notes</h2>
      {notes.length === 0 ? (
        <p>No mastered notes found.</p>
      ) : (
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              <a
                href={`https://docs.google.com/document/d/${note.id}/edit`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {note.name}
              </a>{" "}
              (Created: {new Date(note.createdTime).toLocaleString()})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MasteredNotes;
