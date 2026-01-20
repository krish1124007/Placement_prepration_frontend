import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Award,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    XCircle,
    Clock,
    MessageSquare,
    BarChart3,
    ArrowLeft,
    Download,
    Share2
} from 'lucide-react';
import './InterviewScorecard.css';

const InterviewScorecard = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [scorecard, setScorecard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchScorecard();
    }, [sessionId]);

    const fetchScorecard = async () => {
        try {
            const response = await fetch(`https://placement-prepration-backend.onrender.com/api/v1/interviews/scorecard/${sessionId}`);
            const data = await response.json();

            if (data.success || data.status === 200) {
                setScorecard(data.data);
            } else {
                setError('Failed to load scorecard');
            }
        } catch (error) {
            console.error('Failed to fetch scorecard:', error);
            setError('Failed to load scorecard');
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (grade) => {
        if (!grade) return '#6b7280';
        const letter = grade.charAt(0);
        switch (letter) {
            case 'A': return '#10b981';
            case 'B': return '#3b82f6';
            case 'C': return '#f59e0b';
            case 'D': return '#ef4444';
            case 'F': return '#dc2626';
            default: return '#6b7280';
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#3b82f6';
        if (score >= 40) return '#f59e0b';
        return '#ef4444';
    };

    if (loading) {
        return (
            <div className="scorecard-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Analyzing your performance...</p>
                </div>
            </div>
        );
    }

    if (error || !scorecard) {
        return (
            <div className="scorecard-container">
                <div className="error-state">
                    <XCircle size={48} />
                    <h2>Unable to Load Scorecard</h2>
                    <p>{error || 'Scorecard not found'}</p>
                    <button onClick={() => navigate('/dashboard')} className="btn-primary">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const { performanceAnalysis, interviewSummary, metrics } = scorecard;

    return (
        <div className="scorecard-container">
            <div className="scorecard-wrapper">
                {/* Header */}
                <div className="scorecard-header">
                    <button onClick={() => navigate('/dashboard')} className="back-button">
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                    <div className="header-actions">
                        <button className="action-btn" onClick={() => window.print()}>
                            <Download size={18} />
                            Download
                        </button>
                        <button className="action-btn">
                            <Share2 size={18} />
                            Share
                        </button>
                    </div>
                </div>

                {/* Main Score Display */}
                <div className="score-hero">
                    <div className="score-circle-container">
                        <div className="score-circle" style={{ borderColor: getScoreColor(performanceAnalysis?.overallScore || 0) }}>
                            <div className="score-value">{performanceAnalysis?.overallScore || 0}</div>
                            <div className="score-label">/ 100</div>
                        </div>
                        <div className="grade-badge" style={{ backgroundColor: getGradeColor(performanceAnalysis?.grade) }}>
                            {performanceAnalysis?.grade || 'N/A'}
                        </div>
                    </div>
                    <div className="score-info">
                        <h1>{scorecard.topic}</h1>
                        <p className="level-badge">{scorecard.level} Level</p>
                        <div className="meta-info">
                            <span><Clock size={16} /> {scorecard.durationFormatted}</span>
                            <span><MessageSquare size={16} /> {scorecard.totalExchanges} exchanges</span>
                        </div>
                    </div>
                </div>

                {/* Performance Breakdown */}
                {performanceAnalysis?.breakdown && (
                    <div className="section">
                        <h2 className="section-title">
                            <BarChart3 size={24} />
                            Performance Breakdown
                        </h2>
                        <div className="breakdown-grid">
                            {Object.entries(performanceAnalysis.breakdown).map(([key, value]) => (
                                <div key={key} className="breakdown-item">
                                    <div className="breakdown-header">
                                        <span className="breakdown-label">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <span className="breakdown-score" style={{ color: getScoreColor(value) }}>
                                            {value}/100
                                        </span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${value}%`,
                                                backgroundColor: getScoreColor(value)
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Detailed Feedback */}
                {performanceAnalysis?.detailedFeedback && (
                    <div className="section">
                        <h2 className="section-title">
                            <Award size={24} />
                            Overall Feedback
                        </h2>
                        <div className="feedback-box">
                            <p>{performanceAnalysis.detailedFeedback}</p>
                        </div>
                    </div>
                )}

                {/* Strengths and Weaknesses */}
                <div className="section">
                    <div className="two-column-grid">
                        {/* Strengths */}
                        <div className="strength-weakness-box strengths">
                            <h3>
                                <CheckCircle size={20} />
                                Strengths
                            </h3>
                            <ul>
                                {performanceAnalysis?.strengths?.map((strength, idx) => (
                                    <li key={idx}>
                                        <TrendingUp size={16} />
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="strength-weakness-box weaknesses">
                            <h3>
                                <XCircle size={20} />
                                Areas for Improvement
                            </h3>
                            <ul>
                                {performanceAnalysis?.weaknesses?.map((weakness, idx) => (
                                    <li key={idx}>
                                        <TrendingDown size={16} />
                                        {weakness}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Improvement Recommendations */}
                {performanceAnalysis?.improvements && performanceAnalysis.improvements.length > 0 && (
                    <div className="section">
                        <h2 className="section-title">
                            <TrendingUp size={24} />
                            Recommendations for Improvement
                        </h2>
                        <div className="recommendations-list">
                            {performanceAnalysis.improvements.map((improvement, idx) => (
                                <div key={idx} className="recommendation-item">
                                    <div className="recommendation-number">{idx + 1}</div>
                                    <p>{improvement}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Interview Summary */}
                {interviewSummary && (
                    <div className="section">
                        <h2 className="section-title">
                            <MessageSquare size={24} />
                            Interview Summary
                        </h2>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <span className="summary-label">Topics Covered</span>
                                <div className="topic-tags">
                                    {interviewSummary.keyTopicsCovered?.map((topic, idx) => (
                                        <span key={idx} className="topic-tag">{topic}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Questions Asked</span>
                                <span className="summary-value">{interviewSummary.questionCount || 0}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Response Quality</span>
                                <span className="summary-value">{interviewSummary.responseQuality}</span>
                            </div>
                        </div>
                        {interviewSummary.summary && (
                            <div className="summary-text">
                                <p>{interviewSummary.summary}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Performance Metrics */}
                {metrics && (
                    <div className="section">
                        <h2 className="section-title">
                            <BarChart3 size={24} />
                            Performance Metrics
                        </h2>
                        <div className="metrics-grid">
                            <div className="metric-card">
                                <span className="metric-label">Total Exchanges</span>
                                <span className="metric-value">{metrics.totalExchanges}</span>
                            </div>
                            <div className="metric-card">
                                <span className="metric-label">Your Responses</span>
                                <span className="metric-value">{metrics.userResponses}</span>
                            </div>
                            <div className="metric-card">
                                <span className="metric-label">AI Questions</span>
                                <span className="metric-value">{metrics.aiQuestions}</span>
                            </div>
                            <div className="metric-card">
                                <span className="metric-label">Avg Response Length</span>
                                <span className="metric-value">{metrics.avgUserResponseLength} chars</span>
                            </div>
                            <div className="metric-card">
                                <span className="metric-label">Duration</span>
                                <span className="metric-value">{metrics.durationMinutes}m</span>
                            </div>
                            <div className="metric-card">
                                <span className="metric-label">Engagement Score</span>
                                <span className="metric-value">{Math.round(metrics.engagementScore)}%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="scorecard-actions">
                    <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                        Back to Dashboard
                    </button>
                    <button onClick={() => navigate('/plans')} className="btn-primary">
                        Create Study Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterviewScorecard;
