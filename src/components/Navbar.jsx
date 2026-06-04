import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Bell,
    Search,
    Menu,
    X,
    Sun,
    Moon,
    CheckCircle2
} from 'lucide-react';
import './Navbar.css';

const Navbar = ({ sidebarOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    const handleViewProfile = () => {
        navigate('/profile');
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const dummyNotifications = [
        { id: 1, text: "Your mock interview is scheduled for tomorrow.", time: "1 hour ago", unread: true },
        { id: 2, text: "You have a new message from a recruiter.", time: "3 hours ago", unread: true },
        { id: 3, text: "Your resume score has improved!", time: "1 day ago", unread: false },
    ];

    return (
        <header className="top-navbar">
            <div className="navbar-left">
                <button
                    className="menu-toggle"
                    onClick={toggleSidebar}
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="search-bar">
                    <Search size={20} />
                    <input type="text" placeholder="Search..." />
                </div>
            </div>

            <div className="navbar-right">
                <button
                    className="icon-button theme-toggle"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                </button>
                
                <div className="notification-container" ref={notificationRef}>
                    <button className="icon-button notification-btn" onClick={toggleNotifications}>
                        <Bell size={22} />
                        <span className="notification-badge">3</span>
                    </button>
                    
                    {showNotifications && (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <h3>Notifications</h3>
                                <button className="mark-read-btn">Mark all as read</button>
                            </div>
                            <div className="notification-list">
                                {dummyNotifications.map(notif => (
                                    <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                                        <div className="notification-icon-wrapper">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div className="notification-content">
                                            <p>{notif.text}</p>
                                            <span>{notif.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="notification-footer">
                                <button>View all notifications</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="user-menu" onClick={handleViewProfile}>
                    <div className="user-avatar">
                        {user?.image ? (
                            <img src={user.image} alt={user.name} />
                        ) : (
                            <span>{user?.name?.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-role">{user?.role}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
