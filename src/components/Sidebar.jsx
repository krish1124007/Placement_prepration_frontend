import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Home,
    User,
    BookOpen,
    Trophy,
    Calendar,
    History,
    LogOut,
    Briefcase,
    Share2,
    ClipboardList
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const sidebarItems = [
        { id: 'home', label: 'Dashboard', icon: Home, path: '/dashboard' },
        { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
        { id: 'plans', label: 'Plans', icon: ClipboardList, path: '/plans' },
        { id: 'achievements', label: 'Achievements', icon: Trophy, path: '/achievements' },
        { id: 'socials', label: 'Socials', icon: Share2, path: '/socials' },
        { id: 'schedule', label: 'Schedule', icon: Calendar, path: '/schedule' },
        { id: 'history', label: 'History', icon: History, path: '/history' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <Briefcase size={28} />
                    {isOpen && <span className="logo-text">interPrep</span>}
                </div>
            </div>

            <nav className="sidebar-nav">
                {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => handleNavigation(item.path)}
                        >
                            <Icon size={22} />
                            {isOpen && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-item logout-item" onClick={handleLogout}>
                    <LogOut size={22} />
                    {isOpen && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
