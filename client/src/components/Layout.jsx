import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, FileText, Brain, History, LogOut, Zap } from 'lucide-react';
import './Layout.css';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/notes', icon: FileText, label: 'Notes' },
        { path: '/quiz', icon: Brain, label: 'Quiz' },
        { path: '/quiz/history', icon: History, label: 'History' },
    ];

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <Zap size={28} />
                        <span>NoteWise</span>
                    </div>
                </div>
                
                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || 
                                       (item.path === '/quiz' && location.pathname.startsWith('/quiz') && location.pathname !== '/quiz/history');
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                
                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <div className="user-name">{user?.name}</div>
                            <div className="user-streak">🔥 {user?.current_streak || 0} day streak</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
