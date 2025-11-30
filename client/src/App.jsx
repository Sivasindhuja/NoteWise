import React from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Note from "./components/Note";
import notes from "./Notes.js";

function renderNote(note){
    return (
      <Note noteId={note.notesid} title={note.noteTitle} content={note.noteContent}/>
    )
}
function App(){
  return (
    <div>
      <Header/>
      {notes.map(renderNote)}
      <Footer/>
    </div>
  )
}
export default App;