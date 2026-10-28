import express from "express";
import { generateQuiz, submitQuiz, getQuizHistory, getQuizDetails } from "../controllers/quizController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/generate", generateQuiz);
router.post("/submit", submitQuiz);
router.get("/history", getQuizHistory);
router.get("/history/:quizId", getQuizDetails);

export default router;
