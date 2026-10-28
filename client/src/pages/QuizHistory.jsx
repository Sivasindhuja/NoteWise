import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Brain, Calendar, ChevronRight } from 'lucide-react';
import './QuizHistory.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const QuizHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/quiz/history`);
            setHistory(res.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="history-page">
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="history-page">
            <div className="history-header">
                <h1>Quiz History</h1>
                <p>View all your past quiz attempts and results</p>
            </div>

            {history.length === 0 ? (
                <div className="empty-history">
                    <div className="empty-history-icon">
                        <Brain size={64} />
                    </div>
                    <h3>No quizzes yet</h3>
                    <p>Take your first quiz to see your history here!</p>
                    <Link to="/quiz" className="history-btn">
                        <Brain size={20} />
                        <span>Generate Quiz</span>
                    </Link>
                </div>
            ) : (
                <div className="history-list">
                    {history.map((quiz) => (
                        <Link 
                            key={quiz.id} 
                            to={`/quiz/result/${quiz.id}`} 
                            className="history-card"
                        >
                            <div className="history-card-left">
                                <div className="history-icon">
                                    <Brain size={28} />
                                </div>
                                <div className="history-info">
                                    <h3>Quiz #{quiz.id}</h3>
                                    <p>
                                        <Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.375rem' }} />
                                        {formatDate(quiz.completed_at)}
                                    </p>
                                    <p style={{ marginTop: '0.25rem' }}>
                                        {quiz.questions.length} questions
                                    </p>
                                </div>
                            </div>
                            <div className="history-card-right">
                                <div className="history-score">
                                    <div className="score-value">{quiz.score}%</div>
                                    <div className="score-label">Score</div>
                                </div>
                                <ChevronRight size={24} color="var(--text-muted)" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizHistory;
