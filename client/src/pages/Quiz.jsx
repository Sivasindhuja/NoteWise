import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Brain, Sparkles, CheckCircle } from 'lucide-react';
import './Quiz.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Quiz = () => {
    const [notes, setNotes] = useState([]);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/notes`);
            setNotes(res.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const toggleNoteSelection = (noteId) => {
        setSelectedNotes(prev => 
            prev.includes(noteId) 
                ? prev.filter(id => id !== noteId)
                : [...prev, noteId]
        );
    };

    const generateQuiz = async () => {
        if (selectedNotes.length === 0) {
            alert('Please select at least one note');
            return;
        }

        setGenerating(true);
        try {
            const res = await axios.post(`${API_URL}/api/quiz/generate`, {
                noteIds: selectedNotes
            });
            setQuiz(res.data);
            setAnswers({});
        } catch (error) {
            console.error('Error generating quiz:', error);
            alert('Failed to generate quiz. Make sure you have notes with content.');
        } finally {
            setGenerating(false);
        }
    };

    const selectAnswer = (questionIndex, answer) => {
        setAnswers({ ...answers, [questionIndex]: answer });
    };

    const submitQuiz = async () => {
        if (Object.keys(answers).length !== quiz.questions.length) {
            alert('Please answer all questions');
            return;
        }

        setLoading(true);
        try {
            const answersArray = Object.entries(answers).map(([index, answer]) => ({
                index: parseInt(index),
                answer
            }));
            
            const res = await axios.post(`${API_URL}/api/quiz/submit`, {
                quizId: quiz.quizId,
                answers: answersArray
            });
            
            navigate(`/quiz/result/${quiz.quizId}`, { state: { result: res.data } });
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Failed to submit quiz');
        } finally {
            setLoading(false);
        }
    };

    if (quiz) {
        return (
            <div className="quiz-page">
                <div className="quiz-header">
                    <h1>Take Your Quiz</h1>
                    <p>Answer all questions to get your results</p>
                </div>

                {quiz.questions.map((q, idx) => (
                    <div key={idx} className="quiz-question">
                        <span className="question-number">Question {idx + 1} of {quiz.questions.length}</span>
                        <h3 className="question-text">{q.question}</h3>
                        <div className="options">
                            {q.options.map((option, optIdx) => (
                                <button
                                    key={optIdx}
                                    className={`option ${answers[idx] === option ? 'selected' : ''}`}
                                    onClick={() => selectAnswer(idx, option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <button 
                    className="submit-quiz-btn" 
                    onClick={submitQuiz}
                    disabled={loading || Object.keys(answers).length !== quiz.questions.length}
                >
                    {loading ? 'Submitting...' : 'Submit Quiz'}
                </button>
            </div>
        );
    }

    return (
        <div className="quiz-page">
            <div className="quiz-header">
                <h1>AI-Powered Quiz</h1>
                <p>Generate quizzes from your notes using Gemini AI</p>
            </div>

            <div className="quiz-section">
                <h2>
                    <FileText size={24} />
                    Select Notes
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Choose one or more notes to generate questions from
                </p>

                {notes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        <p>No notes available. Create some notes first!</p>
                    </div>
                ) : (
                    <div className="notes-selection">
                        {notes.map((note) => (
                            <button
                                key={note.id}
                                className={`note-select-card ${selectedNotes.includes(note.id) ? 'selected' : ''}`}
                                onClick={() => toggleNoteSelection(note.id)}
                            >
                                <h4>{note.title || 'Untitled'}</h4>
                                <p>{note.content.substring(0, 60)}...</p>
                            </button>
                        ))}
                    </div>
                )}

                <button 
                    className="generate-btn" 
                    onClick={generateQuiz}
                    disabled={generating || selectedNotes.length === 0}
                >
                    {generating ? (
                        <>
                            <Sparkles size={20} className="animate-spin" />
                            <span>Generating Quiz with AI...</span>
                        </>
                    ) : (
                        <>
                            <Brain size={20} />
                            <span>Generate Quiz ({selectedNotes.length} {selectedNotes.length === 1 ? 'note' : 'notes'} selected)</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Quiz;
