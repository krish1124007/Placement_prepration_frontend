import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import InterviewSetupModal from '../components/InterviewSetupModal';
import {
    BookOpen,
    Trophy,
    Calendar,
    Code,
    Github,
    Linkedin,
    ChevronRight,
    User,
    Share2,
    Mic,
    ClipboardList
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showInterviewModal, setShowInterviewModal] = useState(false);

    const handleViewProfile = () => {
        navigate('/profile');
    };

    return (
        <DashboardLayout>
            {/* Welcome Section */}
            <section className="welcome-section">
                <div className="welcome-content">
                    <h1>Welcome back, {user?.name}!</h1>
                    <p>Ready to ace your next interview?</p>
                </div>
                <div className="quick-actions">
                    <button
                        className="action-button quick-interview"
                        onClick={() => setShowInterviewModal(true)}
                    >
                        <Mic size={20} />
                        Quick Interview
                    </button>
                    <button
                        className="action-button secondary"
                        onClick={() => navigate('/plans')}
                    >
                        <ClipboardList size={20} />
                        Create Plan
                    </button>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <BookOpen size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>12</h3>
                        <p>Interviews Completed</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Trophy size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>8</h3>
                        <p>Achievements</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>3</h3>
                        <p>Upcoming Sessions</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">
                        <Code size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>156</h3>
                        <p>Practice Questions</p>
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="content-grid">
                {/* Profile Summary Card */}
                <div className="content-card profile-card">
                    <div className="card-header">
                        <h2>Profile Overview</h2>
                        <button className="text-button" onClick={handleViewProfile}>
                            View Full Profile <ChevronRight size={18} />
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="profile-summary">
                            <div className="profile-avatar-large">
                                {user?.image ? (
                                    <img src={user.image} alt={user.name} />
                                ) : (
                                    <span>{user?.name?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="profile-details">
                                <h3>{user?.name}</h3>
                                <p className="email">{user?.email}</p>
                                <div className="profile-meta">
                                    <span className="badge">{user?.role}</span>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="social-links">
                            {user?.github && (
                                <a
                                    href={user.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link"
                                >
                                    <Github size={20} />
                                    <span>GitHub</span>
                                </a>
                            )}
                            {user?.linkedin && (
                                <a
                                    href={user.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link"
                                >
                                    <Linkedin size={20} />
                                    <span>LinkedIn</span>
                                </a>
                            )}
                            {user?.leetcode && (
                                <a
                                    href={user.leetcode}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link"
                                >
                                    <Code size={20} />
                                    <span>LeetCode</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Card */}
                <div className="content-card">
                    <div className="card-header">
                        <h2>Recent Activity</h2>
                    </div>
                    <div className="card-body">
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-icon blue">
                                    <BookOpen size={18} />
                                </div>
                                <div className="activity-content">
                                    <p className="activity-title">Completed Mock Interview</p>
                                    <p className="activity-time">2 hours ago</p>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon green">
                                    <Trophy size={18} />
                                </div>
                                <div className="activity-content">
                                    <p className="activity-title">Earned Achievement Badge</p>
                                    <p className="activity-time">1 day ago</p>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon purple">
                                    <Code size={18} />
                                </div>
                                <div className="activity-content">
                                    <p className="activity-title">Solved 10 Coding Problems</p>
                                    <p className="activity-time">2 days ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Sessions Card */}
                <div className="content-card full-width">
                    <div className="card-header">
                        <h2>Upcoming Sessions</h2>
                        <button className="text-button">
                            View All <ChevronRight size={18} />
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="sessions-list">
                            <div className="session-item">
                                <div className="session-date">
                                    <span className="day">15</span>
                                    <span className="month">Jan</span>
                                </div>
                                <div className="session-details">
                                    <h4>Technical Interview Prep</h4>
                                    <p>With John Doe • 2:00 PM - 3:30 PM</p>
                                </div>
                                <button className="session-button">Join</button>
                            </div>
                            <div className="session-item">
                                <div className="session-date">
                                    <span className="day">18</span>
                                    <span className="month">Jan</span>
                                </div>
                                <div className="session-details">
                                    <h4>HR Interview Practice</h4>
                                    <p>With Jane Smith • 10:00 AM - 11:00 AM</p>
                                </div>
                                <button className="session-button">Join</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interview Setup Modal */}
            <InterviewSetupModal
                isOpen={showInterviewModal}
                onClose={() => setShowInterviewModal(false)}
            />
        </DashboardLayout>
    );
};

export default Dashboard;
