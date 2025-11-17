import React, { useState, useEffect } from "react";
import Note from "../components/Note";
import CreateArea from "../components/CreateArea";
import QuizButton from "../components/quizButton";

const Home = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    setNotes(storedNotes);
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
    const updated = notes.filter((_, index) => index !== id);
    setNotes(updated);
  };

  const handleMaster = (id) => {
  const updated = notes.filter((n, i) => i !== id);
  setNotes(updated);
  localStorage.setItem("notes", JSON.stringify(updated));
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
          onMaster={handleMaster} // 🟢 pass handler here
        />
      ))}
    </div>
  );
};

export default Home;
