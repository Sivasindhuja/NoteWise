import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import noteRoutes from "./routes/notes.js";
import quizRoutes from "./routes/quiz.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: "*",
    credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/quiz", quizRoutes);

app.get("/", (req, res) => {
    res.json({ message: "NoteWise API" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
