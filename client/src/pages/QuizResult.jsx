import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Trophy, CheckCircle, XCircle, RotateCcw, History, Home } from 'lucide-react';
import './QuizResult.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const QuizResult = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [result, setResult] = useState(location.state?.result || null);
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(!result);

    useEffect(() => {
        if (!result) {
            fetchQuizDetails();
        }
        if (!quizData) {
            fetchQuizDetails();
        }
    }, [quizId]);

    const fetchQuizDetails = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/quiz/history/${quizId}`);
            setQuizData(res.data);
            if (!result && res.data.score !== null) {
                // Reconstruct result from stored data
                const questions = res.data.questions;
                const answers = res.data.user_answers || [];
                let correct = 0;
                const results = [];
                
                answers.forEach(ans => {
                    const question = questions[ans.index];
                    const isCorrect = question.correctAnswer === ans.answer || 
                                     question.options[ans.answer] === question.correctAnswer ||
                                     ans.answer === question.correctAnswer;
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
                
                setResult({
                    score: res.data.score,
                    correct,
                    total: questions.length,
                    results
                });
            }
        } catch (error) {
            console.error('Error fetching quiz details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="result-page">
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading...
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="result-page">
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Result not found</h2>
                    <Link to="/quiz/history" className="result-btn primary">
                        View History
                    </Link>
                </div>
            </div>
        );
    }

    const getMessage = () => {
        if (result.score >= 90) return "Outstanding! 🎉";
        if (result.score >= 80) return "Excellent work! 👏";
        if (result.score >= 70) return "Good job! 👍";
        if (result.score >= 60) return "Keep practicing! 💪";
        return "Don't give up! Review your notes! 📚";
    };

    return (
        <div className="result-page">
            <div className="result-header">
                <div className="result-badge">
                    <Trophy size={48} />
                </div>
                <h1>Quiz Complete!</h1>
                <div className="result-score">{result.score}%</div>
                <p className="result-subtitle">{getMessage()}</p>
            </div>

            <div className="result-stats">
                <div className="result-stat-card correct">
                    <h3>{result.correct}</h3>
                    <p>Correct Answers</p>
                </div>
                <div className="result-stat-card wrong">
                    <h3>{result.total - result.correct}</h3>
                    <p>Wrong Answers</p>
                </div>
                <div className="result-stat-card">
                    <h3>{result.total}</h3>
                    <p>Total Questions</p>
                </div>
            </div>

            <div className="result-actions">
                <Link to="/quiz" className="result-btn primary">
                    <RotateCcw size={20} />
                    <span>Take Another Quiz</span>
                </Link>
                <Link to="/quiz/history" className="result-btn secondary">
                    <History size={20} />
                    <span>View History</span>
                </Link>
                <Link to="/dashboard" className="result-btn secondary">
                    <Home size={20} />
                    <span>Dashboard</span>
                </Link>
            </div>

            <div className="result-details">
                <h2>Detailed Review</h2>
                {result.results.map((r, idx) => (
                    <div key={idx} className={`result-question ${r.isCorrect ? 'correct' : 'wrong'}`}>
                        <div className="result-question-header">
                            <h4>Question {idx + 1}: {r.question}</h4>
                            <span className={`result-question-badge ${r.isCorrect ? 'correct' : 'wrong'}`}>
                                {r.isCorrect ? (
                                    <>
                                        <CheckCircle size={16} />
                                        Correct
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={16} />
                                        Incorrect
                                    </>
                                )}
                            </span>
                        </div>
                        <div className="result-answer">
                            <span className="result-answer-label">Your Answer:</span>
                            <span className={`result-answer-value ${r.isCorrect ? 'correct-text' : ''}`}>
                                {r.userAnswer}
                            </span>
                        </div>
                        {!r.isCorrect && (
                            <div className="result-answer">
                                <span className="result-answer-label">Correct Answer:</span>
                                <span className="result-answer-value correct-text">
                                    {r.correctAnswer}
                                </span>
                            </div>
                        )}
                        {r.explanation && (
                            <div className="result-explanation">
                                <strong style={{ color: 'var(--text-secondary)' }}>💡 Explanation:</strong> {r.explanation}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuizResult;
