import React, { useState, useEffect } from "react";
import axios from 'axios';
import Header from "./components/Header";
import Footer from "./components/Footer";
import Note from "./components/Note";
import CreateArea from "./components/CreateArea";

function App() {
    const [notes, setNotes] = useState([]);
    const userId = 1; 
    

    useEffect(() => {
    // Define the function INSIDE the effect
    const fetchNotes = async () => {
        try {
            const res = await axios.get(`http://13.48.177.41:5000/api/notes?userId=${userId}`);
            setNotes(res.data);
        } catch (err) {
            console.error("Fetch failed:", err);
        }
    };

    fetchNotes();
}, []); // Empty dependency array ensures it runs once on mount
    // CREATE
    async function addNote(newNote) {
        const res = await axios.post("http://13.48.177.41:5000/api/notes", {
            ...newNote,
            userId: userId
        });
        setNotes(prevNotes => [res.data, ...prevNotes]);
    }

    // DELETE
    async function deleteNote(id) {
        await axios.delete(`http://13.48.177.41:5000/api/notes/${id}`);
        setNotes(prevNotes => prevNotes.filter(n => n.id !== id));
    }

    return (
        <div>
            <Header />
            <CreateArea onAdd={addNote} />
            {notes.map(noteItem => (
                <Note
                    key={noteItem.id}
                    id={noteItem.id}
                    title={noteItem.title}
                    content={noteItem.content}
                    onDelete={deleteNote}
                />
            ))}
            <Footer />
        </div>
    );
}

export default App;

