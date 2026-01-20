import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
    History as HistoryIcon,
    Calendar,
    Clock,
    Mic,
    Award,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Target,
    Brain,
    Loader
} from 'lucide-react';
import './History.css';

const History = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [historyData, setHistoryData] = useState([]);
    const [stats, setStats] = useState({
        totalInterviews: 0,
        totalPlans: 0,
        averageScore: 0,
        achievements: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch history data from backend
    useEffect(() => {
        fetchHistoryData();
    }, []);

    const fetchHistoryData = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('InterPrepaccessToken');
            const apiUrl = 'https://placement-prepration-backend.onrender.com/api/v1';

            if (!token) {
                throw new Error('Please login to view your history');
            }

            const response = await fetch(`${apiUrl}/users/history`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch history data');
            }

            const result = await response.json();

            if (result.success && result.data) {
                setHistoryData(result.data.history || []);
                setStats(result.data.stats || {
                    totalInterviews: 0,
                    totalPlans: 0,
                    averageScore: 0,
                    achievements: 0
                });
            }
        } catch (err) {
            console.error('Error fetching history:', err);
            setError(err.message || 'Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = activeFilter === 'all'
        ? historyData
        : historyData.filter(item => item.type === activeFilter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'status-completed';
            case 'in-progress':
                return 'status-progress';
            case 'failed':
                return 'status-failed';
            default:
                return '';
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'score-excellent';
        if (score >= 60) return 'score-good';
        return 'score-needs-improvement';
    };

    return (
        <DashboardLayout>
            <div className="history-container">
                {/* Header */}
                <div className="history-header">
                    <div>
                        <h1>
                            <HistoryIcon size={32} />
                            Your Journey
                        </h1>
                        <p>Track your progress and review past activities</p>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '4rem',
                        gap: '1rem',
                        color: '#6366f1'
                    }}>
                        <Loader className="animate-spin" size={32} />
                        <p>Loading your history...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        backgroundColor: '#fee2e2',
                        borderRadius: '8px',
                        margin: '2rem 0'
                    }}>
                        <p style={{ color: '#dc2626', fontWeight: '500' }}>{error}</p>
                        <button
                            onClick={fetchHistoryData}
                            style={{
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#6366f1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Main Content - Only show when not loading and no error */}
                {!loading && !error && (
                    <>
                        {/* Filters */}
                        <div className="history-filters">
                            <button
                                className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('all')}
                            >
                                All Activities
                            </button>
                            <button
                                className={`filter-btn ${activeFilter === 'interview' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('interview')}
                            >
                                <Mic size={18} />
                                Interviews
                            </button>
                            <button
                                className={`filter-btn ${activeFilter === 'plan' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('plan')}
                            >
                                <Target size={18} />
                                Plans
                            </button>
                        </div>

                        {/* Stats Overview */}
                        <div className="history-stats">
                            <div className="stat-card-history">
                                <div className="stat-icon-history purple">
                                    <Mic size={24} />
                                </div>
                                <div>
                                    <h3>{stats.totalInterviews}</h3>
                                    <p>Interviews Completed</p>
                                </div>
                            </div>
                            <div className="stat-card-history">
                                <div className="stat-icon-history blue">
                                    <Target size={24} />
                                </div>
                                <div>
                                    <h3>{stats.totalPlans}</h3>
                                    <p>Plans Created</p>
                                </div>
                            </div>
                            <div className="stat-card-history">
                                <div className="stat-icon-history green">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h3>{stats.averageScore}%</h3>
                                    <p>Average Score</p>
                                </div>
                            </div>
                            <div className="stat-card-history">
                                <div className="stat-icon-history orange">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <h3>{stats.achievements}</h3>
                                    <p>Achievements</p>
                                </div>
                            </div>
                        </div>

                        {/* Empty State */}
                        {filteredHistory.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '4rem 2rem',
                                color: '#94a3b8'
                            }}>
                                <HistoryIcon size={64} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <h3 style={{ marginBottom: '0.5rem', color: '#64748b' }}>
                                    No {activeFilter !== 'all' ? activeFilter : ''} history yet
                                </h3>
                                <p>
                                    {activeFilter === 'interview'
                                        ? 'Start your first interview to see your progress here'
                                        : activeFilter === 'plan'
                                            ? 'Create your first plan to begin your journey'
                                            : 'Start interviewing or create a plan to build your history'}
                                </p>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="history-timeline">
                            {filteredHistory.map((item, index) => (
                                <div key={item.id} className="timeline-item-history">
                                    <div className="timeline-dot-history">
                                        {item.type === 'interview' ? (
                                            <Mic size={20} />
                                        ) : (
                                            <Target size={20} />
                                        )}
                                    </div>
                                    <div className="timeline-content-history">
                                        <div className="timeline-header-history">
                                            <div>
                                                <h3>{item.title}</h3>
                                                <div className="timeline-meta">
                                                    <span>
                                                        <Calendar size={14} />
                                                        {new Date(item.date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                    <span>
                                                        <Clock size={14} />
                                                        {item.time}
                                                    </span>
                                                    <span className="duration-badge">
                                                        {item.duration}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`status-badge ${getStatusColor(item.status)}`}>
                                                {item.status === 'completed' && <CheckCircle2 size={16} />}
                                                {item.status === 'in-progress' && <Clock size={16} />}
                                                {item.status === 'failed' && <XCircle size={16} />}
                                                {item.status.replace('-', ' ')}
                                            </div>
                                        </div>

                                        <div className="timeline-body-history">
                                            {item.type === 'interview' && (
                                                <>
                                                    <div className={`score-display ${getScoreColor(item.score)}`}>
                                                        <Brain size={20} />
                                                        <span className="score-value">{item.score}%</span>
                                                        <span className="score-label">Score</span>
                                                    </div>
                                                    {item.feedback && (
                                                        <div className="feedback-box">
                                                            <strong>Feedback:</strong>
                                                            <p>{item.feedback}</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {item.type === 'plan' && (
                                                <div className="progress-display">
                                                    <div className="progress-info">
                                                        <span>Progress</span>
                                                        <span className="progress-percentage">{item.progress}%</span>
                                                    </div>
                                                    <div className="progress-bar-history">
                                                        <div
                                                            className="progress-fill-history"
                                                            style={{ width: `${item.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="topics-list">
                                                {item.topics.map((topic, idx) => (
                                                    <span key={idx} className="topic-tag">
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default History;
