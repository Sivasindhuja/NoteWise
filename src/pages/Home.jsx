// Home.jsx

import React, { useState, useEffect } from "react";

// Components
import Note from "../components/Note";
import CreateArea from "../components/CreateArea";
import QuizButton from "../components/quizButton";

const Home = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem("notes"));
    if (storedNotes) setNotes(storedNotes);
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const addNote = (newNote) => {
    if (notes.length < 20) {
      setNotes([...notes, newNote]);
    } else {
      alert("Max note limit reached! Master and move notes to add more.");
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((_, index) => index !== id));
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginTop: "30px", marginBottom: "20px" }}>
        <p style={{ fontSize: "18px", marginBottom: "10px" }}>
          You’ve added {notes.length} notes — Ready to take a quiz?
        </p>
        <QuizButton notes={notes} />
      </div>

      <CreateArea onAdd={addNote} />
      {notes.map((noteItem, index) => (
        <Note
          key={index}
          id={index}
          title={noteItem.title}
          content={noteItem.content}
          onDelete={deleteNote}
        />
      ))}
    </div>
  );
};

export default Home;
