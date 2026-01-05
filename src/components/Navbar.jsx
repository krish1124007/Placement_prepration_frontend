import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Bell,
    Search,
    Menu,
    X,
    Sun,
    Moon
} from 'lucide-react';
import './Navbar.css';

const Navbar = ({ sidebarOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleViewProfile = () => {
        navigate('/profile');
    };

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
                <button className="icon-button notification-btn">
                    <Bell size={22} />
                    <span className="notification-badge">3</span>
                </button>
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
