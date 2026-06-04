import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { API_BASE_URL } from '../services/api';
import { 
    Trophy, 
    Medal, 
    Star, 
    Award, 
    TrendingUp, 
    Code2, 
    Target,
    Zap,
    Crown,
    Lock,
    ArrowLeft,
    Plus,
    Trash2
} from 'lucide-react';
import './Achievements.css';

const Achievements = () => {
    const { user, login } = useAuth(); // assuming login/setUser is available or we can just reload
    const navigate = useNavigate();
    const [newMilestone, setNewMilestone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [achievements, setAchievements] = useState(user?.achievements || []);

    // Enhanced Mock data for platform badges
    const badges = [
        { 
            id: 1, 
            title: 'First Blood', 
            description: 'Completed your first AI mock interview session with a score above 70.', 
            icon: <Target size={28} />, 
            date: '2 days ago', 
            earned: true,
            tier: 'bronze'
        },
        { 
            id: 2, 
            title: 'Perfect Score', 
            description: 'Achieved a flawless 100% in a rigorous technical assessment.', 
            icon: <Star size={28} />, 
            date: '1 week ago', 
            earned: true,
            tier: 'gold'
        },
        { 
            id: 3, 
            title: 'Consistency King', 
            description: 'Maintained a 7-day practice streak on the platform.', 
            icon: <TrendingUp size={28} />, 
            date: '2 weeks ago', 
            earned: true,
            tier: 'silver'
        },
        { 
            id: 4, 
            title: 'Resume Master', 
            description: 'Achieved an ATS parsing score of 90+ on your uploaded resume.', 
            icon: <Award size={28} />, 
            date: '-', 
            earned: false,
            tier: 'locked'
        },
        { 
            id: 5, 
            title: 'DSA Expert', 
            description: 'Successfully solved 50 Medium/Hard Data Structure algorithms.', 
            icon: <Code2 size={28} />, 
            date: '-', 
            earned: false,
            tier: 'locked'
        },
        { 
            id: 6, 
            title: 'System Architect', 
            description: 'Passed a System Design mock interview with top marks.', 
            icon: <Crown size={28} />, 
            date: '-', 
            earned: false,
            tier: 'locked'
        },
    ];

    const earnedCount = badges.filter(b => b.earned).length;
    const profileCount = achievements.length;
    const totalPoints = earnedCount * 150 + profileCount * 50;

    const handleAddMilestone = async (e) => {
        e.preventDefault();
        if (!newMilestone.trim() || !user?._id) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/students/add-achievement/${user._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ achievement: newMilestone.trim() })
            });

            const data = await res.json();
            if (data.success) {
                setAchievements(data.data.achievements);
                setNewMilestone('');
                // Optionally update global auth state if needed:
                if (login) {
                    const updatedUser = { ...user, achievements: data.data.achievements };
                    login(updatedUser, token);
                }
            }
        } catch (error) {
            console.error('Failed to add milestone', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveMilestone = async (index) => {
        if (!user?._id) return;
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/students/remove-achievement/${user._id}/${index}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (data.success) {
                setAchievements(data.data.achievements);
                if (login) {
                    const updatedUser = { ...user, achievements: data.data.achievements };
                    login(updatedUser, token);
                }
            }
        } catch (error) {
            console.error('Failed to remove milestone', error);
        }
    };

    return (
        <DashboardLayout>
            <div className="achievements-page">
                <div className="achievements-wrapper">
                    
                    {/* ── Page Header ── */}
                    <div className="ach-top-nav">
                        <button className="ach-back-btn" onClick={() => navigate(-1)}>
                            <ArrowLeft size={20} />
                            <span>Back</span>
                        </button>
                    </div>

                    <header className="ach-header">
                        {/* Title removed per request */}
                        
                        <div className="ach-stats-container">
                            <div className="ach-stat-box">
                                <div className="stat-icon-wrapper blue">
                                    <Medal size={20} />
                                </div>
                                <div className="stat-details">
                                    <span className="stat-val">{earnedCount}</span>
                                    <span className="stat-lbl">Badges Earned</span>
                                </div>
                            </div>
                            <div className="ach-stat-box">
                                <div className="stat-icon-wrapper green">
                                    <Award size={20} />
                                </div>
                                <div className="stat-details">
                                    <span className="stat-val">{profileCount}</span>
                                    <span className="stat-lbl">Profile Feats</span>
                                </div>
                            </div>
                            <div className="ach-stat-box highlight">
                                <div className="stat-icon-wrapper orange">
                                    <Zap size={20} />
                                </div>
                                <div className="stat-details">
                                    <span className="stat-val">{totalPoints}</span>
                                    <span className="stat-lbl">Total Points</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* ── Badges Grid ── */}
                    <section className="ach-section">
                        <div className="section-title">
                            <h2>Platform Badges</h2>
                            <span className="section-badge">{earnedCount} / {badges.length} Unlocked</span>
                        </div>
                        
                        <div className="badges-grid-premium">
                            {badges.map((badge) => (
                                <div key={badge.id} className={`premium-badge-card ${badge.tier} ${!badge.earned ? 'locked-card' : ''}`}>
                                    <div className="card-glow"></div>
                                    <div className="badge-icon-area">
                                        <div className="icon-hex">
                                            {badge.earned ? badge.icon : <Lock size={24} />}
                                        </div>
                                    </div>
                                    <div className="badge-content-area">
                                        <h3>{badge.title}</h3>
                                        <p>{badge.description}</p>
                                        <div className="badge-footer">
                                            <span className="badge-date">
                                                {badge.earned ? `Unlocked ${badge.date}` : 'Locked Milestone'}
                                            </span>
                                            {badge.earned && (
                                                <span className="badge-xp">+150 XP</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Profile Achievements ── */}
                    <section className="ach-section profile-section">
                        <div className="section-title">
                            <h2>Personal Milestones</h2>
                            <p>Achievements added manually to your public profile.</p>
                        </div>

                        <div className="profile-ach-content">
                            
                            <form className="add-milestone-form" onSubmit={handleAddMilestone}>
                                <input 
                                    type="text" 
                                    placeholder="e.g., Completed Google Cloud Certification..." 
                                    value={newMilestone}
                                    onChange={(e) => setNewMilestone(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <button type="submit" disabled={isSubmitting || !newMilestone.trim()}>
                                    <Plus size={18} />
                                    {isSubmitting ? 'Adding...' : 'Add'}
                                </button>
                            </form>

                            {achievements.length > 0 ? (
                                <div className="timeline-container">
                                    {achievements.map((achievement, index) => (
                                        <div key={index} className="timeline-item">
                                            <div className="timeline-marker">
                                                <div className="marker-core"></div>
                                            </div>
                                            <div className="timeline-content">
                                                <span className="timeline-text">{achievement}</span>
                                                <button 
                                                    className="delete-milestone-btn" 
                                                    onClick={() => handleRemoveMilestone(index)}
                                                    title="Remove milestone"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-achievements">
                                    <div className="empty-icon">
                                        <Star size={40} />
                                    </div>
                                    <h3>No milestones yet</h3>
                                    <p>You haven't added any personal achievements to your profile. Type above and add some!</p>
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Achievements;
