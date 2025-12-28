import React from "react";
import { useState } from "react";


function CreateArea(props){

    const [note,setNote]=useState({
        title:"",
        content:"",
    });
    function handleChange(event){
        const { name, value } = event.target;
        setNote(prevNote => ({
            ...prevNote,
            [name]: value 
        }));
    }
    function submitNote(event){
        event.preventDefault(); 
        
        if (!note.title.trim() && !note.content.trim()) {
            alert("Please enter content for your note.");
            return;
        }

        props.onAdd(note); 
        
       
        setNote({
            title: "",
            content: ""
        });

    }
    return(
        <div>
            <form>
                <input name="title" placeholder="Title" onChange={handleChange}></input>
                <textarea name="content" placeholder="notes here.." rows="3" onChange={handleChange}></textarea>
                <button onClick={submitNote}>Add Note</button>
            </form>
        </div>
    )
}
export default CreateArea;