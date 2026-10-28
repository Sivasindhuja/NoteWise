import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Brain, History, Flame, Plus, Sparkles } from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        notesCount: 0,
        quizzesCount: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [notesRes, historyRes] = await Promise.all([
                axios.get(`${API_URL}/api/notes`),
                axios.get(`${API_URL}/api/quiz/history`)
            ]);
            setStats({
                notesCount: notesRes.data.length,
                quizzesCount: historyRes.data.length
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Welcome back, {user?.name}! 👋</h1>
                <p>Ready to boost your learning today?</p>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="card-icon notes">
                        <FileText size={28} />
                    </div>
                    <div className="card-content">
                        <h3>{stats.notesCount}</h3>
                        <p>Total Notes</p>
                    </div>
                </div>

                <Link to="/quiz" className="dashboard-card">
                    <div className="card-icon quiz">
                        <Brain size={28} />
                    </div>
                    <div className="card-content">
                        <h3>Generate</h3>
                        <p>AI Quiz</p>
                    </div>
                </Link>

                <Link to="/quiz/history" className="dashboard-card">
                    <div className="card-icon history">
                        <History size={28} />
                    </div>
                    <div className="card-content">
                        <h3>{stats.quizzesCount}</h3>
                        <p>Quizzes Taken</p>
                    </div>
                </Link>

                <div className="dashboard-card">
                    <div className="card-icon streak">
                        <Flame size={28} />
                    </div>
                    <div className="card-content">
                        <h3>{user?.current_streak || 0}</h3>
                        <p>Day Streak 🔥</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <h2>Quick Actions</h2>
                <div className="quick-actions">
                    <Link to="/notes" className="quick-action-btn">
                        <Plus size={20} />
                        <span>Create New Note</span>
                    </Link>
                    <Link to="/quiz" className="quick-action-btn">
                        <Sparkles size={20} />
                        <span>Generate Quiz from Notes</span>
                    </Link>
                    <Link to="/quiz/history" className="quick-action-btn">
                        <History size={20} />
                        <span>View Quiz History</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
