import { query } from "../db.js";
import axios from "axios";
import { getStreakUpdate } from "../utils/streak.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function generateQuiz(req, res) {
    try {
        const userId = req.user.id;
        const { noteIds } = req.body;

        if (!noteIds || noteIds.length === 0) {
            return res.status(400).json({ error: "Select at least one note to generate quiz from" });
        }

        const placeholders = noteIds.map(() => '?').join(',');
        const result = await query(
            `SELECT id, title, content FROM notes WHERE user_id = ? AND id IN (${placeholders})`,
            [userId, ...noteIds]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Notes not found" });
        }

        const notesContent = result.rows.map((note, idx) => 
            `Note ${idx + 1}:\nTitle: ${note.title}\nContent: ${note.content}\n`
        ).join('\n---\n');

        const prompt = `You are an expert quiz generator. Generate 5 multiple choice questions based on the following notes. 

${notesContent}

For each question, provide:
- question: the question text
- options: array of 4 options
- correctAnswer: the correct option (must be one of the options exactly as written)
- explanation: brief explanation of the answer

Return the response in valid JSON format as an array of questions. Make questions test understanding. Ensure all questions are answerable from the notes.`;

        try {
            const geminiResponse = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
                {
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    }
                }
            );

            const text = geminiResponse.data.candidates[0].content.parts[0].text;
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

            await query(
                "INSERT INTO quizzes (user_id, questions, note_ids) VALUES (?, ?, ?)",
                [userId, JSON.stringify(questions), JSON.stringify(noteIds)]
            );

            const quizResult = await query("SELECT * FROM quizzes WHERE user_id = ? ORDER BY id DESC LIMIT 1", [userId]);

            res.json({
                quizId: quizResult.rows[0].id,
                questions: questions.map((q, idx) => ({
                    index: idx,
                    question: q.question,
                    options: q.options,
                    explanation: q.explanation
                }))
            });
        } catch (apiError) {
            console.error("Gemini API error:", apiError.response?.data || apiError.message);
            const fallbackQuestions = [
                {
                    question: "Review your selected notes - what key concept stands out?",
                    options: ["Concept A from notes", "Concept B from notes", "Concept C from notes", "Concept D from notes"],
                    correctAnswer: "Concept A from notes",
                    explanation: "This is a generated placeholder. Add more detailed notes for better AI questions."
                }
            ];
            
            await query(
                "INSERT INTO quizzes (user_id, questions, note_ids) VALUES (?, ?, ?)",
                [userId, JSON.stringify(fallbackQuestions), JSON.stringify(noteIds)]
            );

            const quizResult = await query("SELECT * FROM quizzes WHERE user_id = ? ORDER BY id DESC LIMIT 1", [userId]);

            res.json({
                quizId: quizResult.rows[0].id,
                questions: fallbackQuestions.map((q, idx) => ({
                    index: idx,
                    question: q.question,
                    options: q.options,
                    explanation: q.explanation
                }))
            });
        }
    } catch (error) {
        console.error("Generate quiz error:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function submitQuiz(req, res) {
    try {
        const userId = req.user.id;
        const { quizId, answers } = req.body;

        const quizResult = await query("SELECT * FROM quizzes WHERE id = ? AND user_id = ?", [quizId, userId]);
        if (quizResult.rows.length === 0) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        const questions = JSON.parse(quizResult.rows[0].questions);
        let correct = 0;
        const results = [];

        answers.forEach(ans => {
            const question = questions[ans.index];
            const isCorrect = question.correctAnswer === ans.answer;
            
            if (isCorrect) correct++;
            results.push({
                index: ans.index,
                question: question.question,
                userAnswer: ans.answer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                explanation: question.explanation
            });
        });

        const score = Math.round((correct / questions.length) * 100);

        await query(
            "UPDATE quizzes SET user_answers = ?, score = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?",
            [JSON.stringify(answers), score, quizId]
        );

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

        res.json({
            score,
            correct,
            total: questions.length,
            results
        });
    } catch (error) {
        console.error("Submit quiz error:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function getQuizHistory(req, res) {
    try {
        const userId = req.user.id;
        const result = await query(
            "SELECT id, score, questions, note_ids, completed_at, created_at FROM quizzes WHERE user_id = ? AND completed_at IS NOT NULL ORDER BY completed_at DESC",
            [userId]
        );
        const parsed = result.rows.map(r => ({
            ...r,
            questions: JSON.parse(r.questions),
            note_ids: r.note_ids ? JSON.parse(r.note_ids) : []
        }));
        res.json(parsed);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getQuizDetails(req, res) {
    try {
        const userId = req.user.id;
        const { quizId } = req.params;
        const result = await query(
            "SELECT * FROM quizzes WHERE id = ? AND user_id = ?",
            [quizId, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Quiz not found" });
        }
        const quiz = result.rows[0];
        quiz.questions = JSON.parse(quiz.questions);
        if (quiz.note_ids) quiz.note_ids = JSON.parse(quiz.note_ids);
        if (quiz.user_answers) quiz.user_answers = JSON.parse(quiz.user_answers);
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
