import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET || "notewise_secret_key_change_in_prod";

export async function signup(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if user exists
        const existingUser = await query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        await query(
            "INSERT INTO users (name, email, password, current_streak, last_activity_date) VALUES (?, ?, ?, ?, ?)",
            [name, email, hashedPassword, 0, null]
        );

        const result = await query("SELECT id, name, email, current_streak FROM users WHERE email = ?", [email]);
        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                current_streak: user.current_streak
            }
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function signin(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const result = await query("SELECT * FROM users WHERE email = ?", [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                current_streak: user.current_streak
            }
        });
    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function getMe(req, res) {
    try {
        const result = await query("SELECT id, name, email, current_streak, last_activity_date FROM users WHERE id = ?", [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
