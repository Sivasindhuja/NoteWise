import { query } from "../db.js";
import { getStreakUpdate } from "../utils/streak.js";

export async function createNote(req, res) {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;

        if (!title && !content) {
            return res.status(400).json({ error: "Note must have a title or content" });
        }

        await query(
            "INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)",
            [userId, title || "", content || ""]
        );

        const result = await query("SELECT * FROM notes WHERE user_id = ? ORDER BY id DESC LIMIT 1", [userId]);
        const note = result.rows[0];

        // Update streak
        const userResult = await query("SELECT current_streak, last_activity_date FROM users WHERE id = ?", [userId]);
        const user = userResult.rows[0];
        const streakUpdate = getStreakUpdate(user.last_activity_date, user.current_streak);
        
        if (streakUpdate.shouldUpdate) {
            await query(
                "UPDATE users SET current_streak = ?, last_activity_date = date('now') WHERE id = ?",
                [streakUpdate.streak, userId]
            );
        } else {
            await query("UPDATE users SET last_activity_date = date('now') WHERE id = ?", [userId]);
        }

        res.status(201).json(note);
    } catch (error) {
        console.error("Create note error:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function readAllNotes(req, res) {
    try {
        const userId = req.user.id;
        const result = await query(
            "SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Read notes error:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function readNote(req, res) {
    try {
        const { noteId } = req.params;
        const userId = req.user.id;
        const result = await query(
            "SELECT * FROM notes WHERE id = ? AND user_id = ?",
            [noteId, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Note not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function updateNote(req, res) {
    try {
        const { noteId } = req.params;
        const { title, content } = req.body;
        const userId = req.user.id;

        await query(
            "UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
            [title || "", content || "", noteId, userId]
        );

        const result = await query("SELECT * FROM notes WHERE id = ? AND user_id = ?", [noteId, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Note not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteNote(req, res) {
    try {
        const { noteId } = req.params;
        const userId = req.user.id;

        const result = await query("DELETE FROM notes WHERE id = ? AND user_id = ?", [noteId, userId]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: "Note not found" });
        }

        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
