import {query} from "../db.js"
import axios from"axios";

//create note function

 // controllers/noteController.js
export async function createNote(req, res) {
    try {
        const { title, content, userId } = req.body; // Extract from body, not params
        const result = await query(
            "INSERT INTO notes(user_id, title, content, is_verified) VALUES ($1, $2, $3, $4) RETURNING *",
            [userId, title, content, false]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
//circular JSON
// READ: Get all notes for a user
// export async function readAllNotes(req, res) {
//     try {
//         // Fix: Use req.query because Frontend sends ?userId=1
//         const userId = req.query.userId; 
//         const result = await query(
//             "SELECT * FROM notes WHERE user_id = $1 ORDER BY id DESC",
//             [userId]
//         );
//         res.json(result.rows);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }

export async function readAllNotes(req, res) {
    try {
        const userId = req.query.userId;
        const result = await query(
            "SELECT * FROM notes WHERE user_id = $1 ORDER BY id DESC", 
            [userId]
        );
        
        // IMPORTANT: Always send .rows, not just result
        res.json(result.rows); 
    } catch (error) {
        console.error("SQL Error:", error.message);
        res.status(500).json({ error: error.message });
    }
}

// DELETE: Remove one note
export async function deleteNote(req, res) {
    try {
        const { noteId } = req.params;
        // Fix: Use the actual column name (likely 'id') and the placeholder $1
        await query("DELETE FROM notes WHERE id = $1", [noteId]);
        res.json({ message: `Note ${noteId} deleted successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


//edit a note

export async function editNotes(req,res){
    const {noteId}=req.params;
        const { title, content } = req.body;
        const result = await query(
            "UPDATE notes SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
            [title, content, noteId]
        );
        res.json(result.rows[0]);

}
