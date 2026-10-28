import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Quiz from './pages/Quiz';
import QuizHistory from './pages/QuizHistory';
import QuizResult from './pages/QuizResult';
import Layout from './components/Layout';
import './App.css';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading...</div>
            </div>
        );
    }
    
    return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
    const { user } = useAuth();
    
    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="notes" element={<Notes />} />
                <Route path="quiz" element={<Quiz />} />
                <Route path="quiz/history" element={<QuizHistory />} />
                <Route path="quiz/result/:quizId" element={<QuizResult />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
