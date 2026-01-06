import { useState } from 'react';
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
    Brain
} from 'lucide-react';
import './History.css';

const History = () => {
    const [activeFilter, setActiveFilter] = useState('all');

    // Dummy history data
    const historyData = [
        {
            id: 1,
            type: 'interview',
            title: 'Full Stack Developer Interview',
            date: '2026-01-05',
            time: '14:30',
            duration: '45 mins',
            status: 'completed',
            score: 85,
            feedback: 'Great technical knowledge, good communication skills',
            topics: ['React', 'Node.js', 'System Design']
        },
        {
            id: 2,
            type: 'plan',
            title: 'Frontend Developer - 30 Days Plan',
            date: '2026-01-04',
            time: '10:00',
            duration: '30 days',
            status: 'in-progress',
            progress: 65,
            topics: ['JavaScript', 'React', 'CSS']
        },
        {
            id: 3,
            type: 'interview',
            title: 'Backend Developer Mock Interview',
            date: '2026-01-03',
            time: '16:00',
            duration: '30 mins',
            status: 'completed',
            score: 78,
            feedback: 'Good understanding of databases, needs improvement in API design',
            topics: ['MongoDB', 'Express', 'REST APIs']
        },
        {
            id: 4,
            type: 'plan',
            title: 'Data Structures & Algorithms',
            date: '2026-01-02',
            time: '09:00',
            duration: '45 days',
            status: 'completed',
            progress: 100,
            topics: ['Arrays', 'Trees', 'Graphs', 'Dynamic Programming']
        },
        {
            id: 5,
            type: 'interview',
            title: 'HR Round Practice',
            date: '2026-01-01',
            time: '11:30',
            duration: '20 mins',
            status: 'completed',
            score: 92,
            feedback: 'Excellent communication, well-prepared answers',
            topics: ['Behavioral Questions', 'Company Research']
        },
        {
            id: 6,
            type: 'plan',
            title: 'System Design Mastery',
            date: '2025-12-30',
            time: '15:00',
            duration: '60 days',
            status: 'in-progress',
            progress: 40,
            topics: ['Scalability', 'Load Balancing', 'Caching']
        }
    ];

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
                            <h3>12</h3>
                            <p>Interviews Completed</p>
                        </div>
                    </div>
                    <div className="stat-card-history">
                        <div className="stat-icon-history blue">
                            <Target size={24} />
                        </div>
                        <div>
                            <h3>5</h3>
                            <p>Plans Created</p>
                        </div>
                    </div>
                    <div className="stat-card-history">
                        <div className="stat-icon-history green">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3>85%</h3>
                            <p>Average Score</p>
                        </div>
                    </div>
                    <div className="stat-card-history">
                        <div className="stat-icon-history orange">
                            <Award size={24} />
                        </div>
                        <div>
                            <h3>8</h3>
                            <p>Achievements</p>
                        </div>
                    </div>
                </div>

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
            </div>
        </DashboardLayout>
    );
};

export default History;
