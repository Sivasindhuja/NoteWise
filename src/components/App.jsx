import React, { useState,useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import QuizButton from "./quizButton";

function App() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem("notes"));
    if (storedNotes) {
      setNotes(storedNotes);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);



  function addNote(newNote) {
    setNotes(prevNotes => {
      if(prevNotes.length<20){
        return [...prevNotes,newNote];
      }
      else{
        alert("Max note limit reached!Master and move notes to add more.");
        return prevNotes;
      }
      
    });
  }

  function deleteNote(id) {
    setNotes(prevNotes => {
      return prevNotes.filter((noteItem, index) => {
        return index !== id;
      });
    });
  }

  return (
    <div>
      <Header />
      <div
        style={{ textAlign: "center", marginTop: "30px", marginBottom: "20px" }}
      >
        <p style={{ fontSize: "18px", marginBottom: "10px" }}>
          You’ve added {notes.length} notes — Ready to take a quiz?
        </p>
        <QuizButton />
      </div>

      <CreateArea onAdd={addNote} />
      {notes.map((noteItem, index) => {
        return (
          <Note
            key={index}
            id={index}
            title={noteItem.title}
            content={noteItem.content}
            onDelete={deleteNote}
          />
        );
      })}

      <Footer />
    </div>
  );
}

export default App;
