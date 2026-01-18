import { useState, useEffect } from 'react';
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
    ClipboardList,
    Play,
    AlertCircle,
    Download,
    Target,
    Edit,
    Sparkles
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [modalPrefillData, setModalPrefillData] = useState(null);
    const [scheduledInterviews, setScheduledInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDownloadInfo, setShowDownloadInfo] = useState(false);
    const [showFocusModal, setShowFocusModal] = useState(false);
    const [focusLoading, setFocusLoading] = useState(false);
    const [focusActivated, setFocusActivated] = useState(false);

    useEffect(() => {
        if (user?._id) {
            fetchScheduledInterviews();
        }
    }, [user]);

    const fetchScheduledInterviews = async () => {
        try {
            // Fetch user's plans
            const response = await fetch(`https://placement-prepration-backend.onrender.com/api/v1/plans/user/${user._id}`);
            const data = await response.json();

            if (data.success && data.data) {
                const today = new Date().toISOString().split('T')[0];
                const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

                const interviews = [];

                // Check DSA interviews
                if (data.data.dsa && Array.isArray(data.data.dsa)) {
                    data.data.dsa.forEach(item => {
                        if (item.date) {
                            interviews.push({
                                type: 'dsa',
                                topic: item.topic || 'DSA Interview',
                                date: item.date,
                                isToday: item.date === today,
                                isTomorrow: item.date === tomorrow
                            });
                        }
                    });
                }

                // Check aptitude interviews (if they exist)
                if (data.data.aptitude && Array.isArray(data.data.aptitude)) {
                    data.data.aptitude.forEach(item => {
                        if (item.date) {
                            interviews.push({
                                type: 'normal',
                                topic: item.topic || 'Aptitude Interview',
                                date: item.date,
                                isToday: item.date === today,
                                isTomorrow: item.date === tomorrow
                            });
                        }
                    });
                }

                // Sort by date
                interviews.sort((a, b) => new Date(a.date) - new Date(b.date));

                setScheduledInterviews(interviews);
            }
        } catch (error) {
            console.error('Failed to fetch scheduled interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartScheduledInterview = (interview) => {
        // Prefill the modal with interview data
        setModalPrefillData({
            topic: interview.topic,
            level: 'Mid-Level', // Default level, can be customized
            interviewType: interview.type,
            description: `Scheduled interview for ${interview.topic}`
        });
        setShowInterviewModal(true);
    };

    const handleViewProfile = () => {
        navigate('/profile');
    };

    const handleTurnOnFocus = () => {
        setFocusLoading(true);
        setTimeout(() => {
            setFocusLoading(false);
            setFocusActivated(true);
        }, 2000);
    };

    const todayInterviews = scheduledInterviews.filter(i => i.isToday);
    const tomorrowInterviews = scheduledInterviews.filter(i => i.isTomorrow);

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
                        onClick={() => {
                            setModalPrefillData(null);
                            setShowInterviewModal(true);
                        }}
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

            {/* Ultra Focus Mode Section */}
            <section className="ultra-focus-section">
                <div className="ultra-focus-card">
                    <div className="new-feature-banner">
                        <Sparkles size={16} />
                        <span>Super New Feature</span>
                        <Sparkles size={16} />
                    </div>
                    <div className="ultra-focus-header">
                        <Target size={32} />
                        <h2>Turn on Ultra Focus Mode</h2>
                    </div>
                    <button
                        className="ultra-focus-button"
                        onClick={() => setShowFocusModal(true)}
                    >
                        <Target size={20} />
                        Ultra Project Mode
                    </button>
                </div>
            </section>

            {/* Ultra Focus Modal */}
            {showFocusModal && (
                <div className="focus-modal-overlay">
                    <div className="focus-modal-container">
                        {!focusLoading && !focusActivated && (
                            <>
                                <div className="focus-modal-header">
                                    <Target size={48} />
                                    <h2>Ultra Focus Mode</h2>
                                </div>
                                <div className="focus-modal-body">
                                    <p className="focus-warning">
                                        ⚠️ After Ultra Focus Mode is ON
                                    </p>
                                    <div className="focus-restriction-list">
                                        <p>You can't access to use any social media applications like:</p>
                                        <ul>
                                            <li>📸 Instagram</li>
                                            <li>👻 Snapchat</li>
                                            <li>📘 Facebook</li>
                                            <li>🐦 Twitter</li>
                                            <li>🎵 TikTok</li>
                                            <li>And many more...</li>
                                        </ul>
                                        <p className="focus-goal-text">
                                            Until you complete today's goals! If you do not complete today's goals,
                                            you can't open your social media apps.
                                        </p>
                                    </div>
                                </div>
                                <div className="focus-modal-footer">
                                    <button
                                        className="focus-edit-button"
                                        onClick={() => setShowFocusModal(false)}
                                    >
                                        <Edit size={18} />
                                        Edit
                                    </button>
                                    <button
                                        className="focus-turn-on-button"
                                        onClick={handleTurnOnFocus}
                                    >
                                        <Target size={18} />
                                        Turn On
                                    </button>
                                </div>
                            </>
                        )}

                        {focusLoading && (
                            <div className="focus-loading-container">
                                <div className="loading-spinner">
                                    <Sparkles size={64} className="sparkle-icon" />
                                </div>
                                <h3>Activating Ultra Focus Mode...</h3>
                                <div className="loading-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                        {focusActivated && (
                            <div className="focus-success-container">
                                <div className="success-icon-wrapper">
                                    <Target size={64} className="success-icon" />
                                    <Sparkles size={32} className="sparkle-accent" />
                                </div>
                                <h2 className="typing-text">Focus mode is now active! 🎯</h2>
                                <p>You're all set to crush your goals today!</p>
                                <button
                                    className="focus-close-button"
                                    onClick={() => {
                                        setShowFocusModal(false);
                                        setFocusActivated(false);
                                    }}
                                >
                                    Get Started
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Download App Section */}


            {/* Scheduled Interviews Alert */}
            {(todayInterviews.length > 0 || tomorrowInterviews.length > 0) && (
                <section className="scheduled-interviews-section">
                    {todayInterviews.length > 0 && (
                        <div className="interview-alert today">
                            <div className="alert-header">
                                <AlertCircle size={24} />
                                <h3>Today's Interviews</h3>
                            </div>
                            <div className="interview-list">
                                {todayInterviews.map((interview, idx) => (
                                    <div key={idx} className="interview-card">
                                        <div className="interview-info">
                                            <div className="interview-icon">
                                                {interview.type === 'dsa' ? <Code size={20} /> : <Mic size={20} />}
                                            </div>
                                            <div className="interview-details">
                                                <h4>{interview.topic}</h4>
                                                <p>{interview.type === 'dsa' ? 'DSA Interview' : 'Normal Interview'}</p>
                                            </div>
                                        </div>
                                        <button
                                            className="start-interview-btn"
                                            onClick={() => handleStartScheduledInterview(interview)}
                                        >
                                            <Play size={16} />
                                            Start Interview
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tomorrowInterviews.length > 0 && (
                        <div className="interview-alert tomorrow">
                            <div className="alert-header">
                                <Calendar size={24} />
                                <h3>Tomorrow's Interviews</h3>
                            </div>
                            <div className="interview-list">
                                {tomorrowInterviews.map((interview, idx) => (
                                    <div key={idx} className="interview-card">
                                        <div className="interview-info">
                                            <div className="interview-icon">
                                                {interview.type === 'dsa' ? <Code size={20} /> : <Mic size={20} />}
                                            </div>
                                            <div className="interview-details">
                                                <h4>{interview.topic}</h4>
                                                <p>{interview.type === 'dsa' ? 'DSA Interview' : 'Normal Interview'}</p>
                                            </div>
                                        </div>
                                        <span className="interview-date">Tomorrow</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            )}

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
                        <h3>{scheduledInterviews.length}</h3>
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

            <section className="download-app-section">
                <div className="download-card">
                    <div className="download-header">
                        <Download size={32} />
                        <h2>To unlock the full potential of our app, please download our application</h2>
                    </div>
                    <button
                        className="download-button"
                        onClick={() => setShowDownloadInfo(true)}
                    >
                        <Download size={20} />
                        Download Now
                    </button>
                </div>

                {showDownloadInfo && (
                    <div className="download-info-container">
                        <div className="download-info-content">
                            <div className="info-icon">
                                <Download size={40} />
                            </div>
                            <h3>Our Test version app is ready</h3>
                            <p>Please download this app and unlock your full potential</p>
                            <button className="download-final-button">
                                <Download size={18} />
                                Download Test Version
                            </button>
                        </div>
                    </div>
                )}
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
            </div>

            {/* Interview Setup Modal */}
            <InterviewSetupModal
                isOpen={showInterviewModal}
                onClose={() => {
                    setShowInterviewModal(false);
                    setModalPrefillData(null);
                }}
                prefillData={modalPrefillData}
            />
        </DashboardLayout>
    );
};

export default Dashboard;
