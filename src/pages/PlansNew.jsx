import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { planAPI } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import {
    Plus,
    Target,
    Calendar,
    Code,
    BookOpen,
    Loader2,
    Brain,
    Clock,
    User,
    Briefcase,
    Languages,
    X,
    CheckCircle2,
    Circle,
    TrendingUp,
    Award
} from 'lucide-react';
import './PlansNew.css';

const PlansNew = () => {
    const navigate = useNavigate();
    const [myPlans, setMyPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [modalAnimation, setModalAnimation] = useState('enter');

    const [formData, setFormData] = useState({
        subject: '',
        duration: '',
        experience: 'Fresher',
        company: 'Any',
        isGithubUse: true,
        language: 'English',
        planguage: 'JavaScript',
        dsa: true,
        aptitude: true,
        interview: true,
        projects: true
    });

    useEffect(() => {
        fetchMyPlans();
    }, []);

    const fetchMyPlans = async () => {
        try {
            setLoading(true);
            const response = await planAPI.getMyAllPlans();
            if (response.status === 200) {
                setMyPlans(response.data?.data || []);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                experice: formData.experience,
            };

            const response = await planAPI.createPlan(payload);

            if (response.status === 200) {
                let planData = response.data?.data;

                if (typeof planData === 'string') {
                    try {
                        const cleanJson = planData.replace(/```json\n?|\n?```/g, '');
                        planData = JSON.parse(cleanJson);
                    } catch (e) {
                        const firstBrace = planData.indexOf('{');
                        const lastBrace = planData.lastIndexOf('}');
                        if (firstBrace !== -1 && lastBrace !== -1) {
                            const jsonStr = planData.substring(firstBrace, lastBrace + 1);
                            planData = JSON.parse(jsonStr);
                        }
                    }
                }
                setGeneratedPlan({ payload, plan: planData });
            }
        } catch (error) {
            console.error('Error generating plan:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async () => {
        if (!generatedPlan) return;

        setLoading(true);
        try {
            await planAPI.savePlan(generatedPlan.payload, generatedPlan.plan);
            setGeneratedPlan(null);
            setShowCreateModal(false);
            fetchMyPlans();
        } catch (error) {
            console.error('Error saving plan:', error);
        } finally {
            setLoading(false);
        }
    };

    const openPlanDetails = (id) => {
        navigate(`/plan-roadmap/${id}`);
    };

    const closePlanModal = () => {
        setModalAnimation('exit');
        setTimeout(() => {
            setShowPlanModal(false);
            setSelectedPlan(null);
        }, 300);
    };

    const closeCreateModal = () => {
        setModalAnimation('exit');
        setTimeout(() => {
            setShowCreateModal(false);
            setGeneratedPlan(null);
        }, 300);
    };

    const toggleTaskCompletion = async (section, index, subIndex = null) => {
        if (!selectedPlan) return;

        const plan = selectedPlan.planDetails;
        let currentStatus = false;

        if (section === 'aptitude' && plan.aptitude && plan.aptitude[index]) {
            currentStatus = plan.aptitude[index].competition || false;
        } else if (section === 'dsa' && plan.dsa && plan.dsa[index]) {
            currentStatus = plan.dsa[index].competition || false;
        } else if (section === 'subject' && plan.subject && plan.subject[index]) {
            if (subIndex !== null && plan.subject[index].topics && plan.subject[index].topics[subIndex]) {
                currentStatus = plan.subject[index].topics[subIndex].competition || false;
            }
        }

        try {
            const response = await planAPI.updateTaskCompletion(selectedPlan._id, {
                section,
                index,
                subIndex,
                completed: !currentStatus
            });

            if (response.status === 200) {
                // Update local state
                const updatedPlan = { ...selectedPlan };
                if (section === 'aptitude') {
                    updatedPlan.planDetails.aptitude[index].competition = !currentStatus;
                } else if (section === 'dsa') {
                    updatedPlan.planDetails.dsa[index].competition = !currentStatus;
                } else if (section === 'subject' && subIndex !== null) {
                    updatedPlan.planDetails.subject[index].topics[subIndex].competition = !currentStatus;
                }
                setSelectedPlan(updatedPlan);
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const calculateProgress = (plan) => {
        if (!plan || !plan.planDetails) return 0;

        let total = 0;
        let completed = 0;

        const details = plan.planDetails;

        if (details.aptitude) {
            total += details.aptitude.length;
            completed += details.aptitude.filter(t => t.competition).length;
        }

        if (details.dsa) {
            total += details.dsa.length;
            completed += details.dsa.filter(t => t.competition).length;
        }

        if (details.subject) {
            details.subject.forEach(sub => {
                if (sub.topics) {
                    total += sub.topics.length;
                    completed += sub.topics.filter(t => t.competition).length;
                }
            });
        }

        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    return (
        <DashboardLayout>
            <div className="plans-new-container">
                {/* Header */}
                <div className="plans-new-header">
                    <div>
                        <h1>My Preparation Plans</h1>
                        <p>Track your progress and achieve your placement goals</p>
                    </div>
                    <button
                        className="create-plan-btn"
                        onClick={() => {
                            setModalAnimation('enter');
                            setShowCreateModal(true);
                        }}
                    >
                        <Plus size={20} />
                        Create New Plan
                    </button>
                </div>

                {/* Plans Grid */}
                {loading && myPlans.length === 0 ? (
                    <div className="loading-state">
                        <Loader2 className="spinner" size={48} />
                        <p>Loading your plans...</p>
                    </div>
                ) : myPlans.length > 0 ? (
                    <div className="plans-grid">
                        {myPlans.map((plan) => {
                            const progress = calculateProgress(plan);
                            return (
                                <div
                                    key={plan._id}
                                    className="plan-card-new"
                                    onClick={() => openPlanDetails(plan._id)}
                                >
                                    <div className="plan-card-header-new">
                                        <div className="plan-icon-wrapper">
                                            <Target size={24} />
                                        </div>
                                        <div className="plan-progress-badge">
                                            {progress}%
                                        </div>
                                    </div>

                                    <h3 className="plan-card-title">{plan.subject}</h3>

                                    <div className="plan-card-meta">
                                        <div className="meta-item">
                                            <Clock size={14} />
                                            <span>{plan.duration}</span>
                                        </div>
                                        <div className="meta-item">
                                            <User size={14} />
                                            <span>{plan.experience}</span>
                                        </div>
                                    </div>

                                    <div className="plan-card-company">
                                        <Briefcase size={16} />
                                        <span>{plan.company || 'Any Company'}</span>
                                    </div>

                                    <div className="plan-card-progress">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="plan-card-tags">
                                        {plan.dsa && <span className="tag tag-dsa">DSA</span>}
                                        {plan.aptitude && <span className="tag tag-aptitude">Aptitude</span>}
                                        {plan.interview && <span className="tag tag-interview">Interview</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state-new">
                        <div className="empty-icon">
                            <Target size={64} />
                        </div>
                        <h3>No Plans Yet</h3>
                        <p>Create your first preparation plan to get started on your placement journey</p>
                        <button
                            className="create-plan-btn"
                            onClick={() => {
                                setModalAnimation('enter');
                                setShowCreateModal(true);
                            }}
                        >
                            <Plus size={20} />
                            Create Your First Plan
                        </button>
                    </div>
                )}

                {/* Create Plan Modal */}
                {showCreateModal && (
                    <div className={`modal-overlay-new ${modalAnimation}`} onClick={closeCreateModal}>
                        <div
                            className={`modal-content-new create-modal ${modalAnimation}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header-new">
                                <h2>
                                    <Brain size={24} />
                                    Create AI-Powered Plan
                                </h2>
                                <button className="modal-close-btn-new" onClick={closeCreateModal}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="modal-body-new">
                                {!generatedPlan ? (
                                    <form onSubmit={handleCreatePlan} className="create-plan-form">
                                        <div className="form-row">
                                            <div className="form-field">
                                                <label>Target Role</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Full Stack Developer"
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>Target Company</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Google, Amazon"
                                                    value={formData.company}
                                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-field">
                                                <label>Duration</label>
                                                <select
                                                    value={formData.duration}
                                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Select Duration</option>
                                                    <option value="15 days">15 Days</option>
                                                    <option value="30 days">30 Days</option>
                                                    <option value="45 days">45 Days</option>
                                                    <option value="60 days">60 Days</option>
                                                    <option value="90 days">3 Months</option>
                                                </select>
                                            </div>
                                            <div className="form-field">
                                                <label>Experience Level</label>
                                                <select
                                                    value={formData.experience}
                                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                                >
                                                    <option value="Fresher">Fresher (0-1 years)</option>
                                                    <option value="Junior">Junior (1-3 years)</option>
                                                    <option value="Mid">Mid-Level (3-5 years)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-field">
                                                <label>Programming Language</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., JavaScript, Python"
                                                    value={formData.planguage}
                                                    onChange={(e) => setFormData({ ...formData, planguage: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>Interview Language</label>
                                                <select
                                                    value={formData.language}
                                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                                >
                                                    <option value="English">English</option>
                                                    <option value="Hinglish">Hinglish</option>
                                                    <option value="Hindi">Hindi</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-field">
                                            <label>Include Modules</label>
                                            <div className="toggles-row">
                                                <label className="toggle-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.dsa}
                                                        onChange={(e) => setFormData({ ...formData, dsa: e.target.checked })}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                    <span>DSA Rounds</span>
                                                </label>
                                                <label className="toggle-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.aptitude}
                                                        onChange={(e) => setFormData({ ...formData, aptitude: e.target.checked })}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                    <span>Aptitude Tests</span>
                                                </label>
                                                <label className="toggle-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.interview}
                                                        onChange={(e) => setFormData({ ...formData, interview: e.target.checked })}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                    <span>Tech Interviews</span>
                                                </label>
                                                <label className="toggle-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isGithubUse}
                                                        onChange={(e) => setFormData({ ...formData, isGithubUse: e.target.checked })}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                    <span>Analyze GitHub</span>
                                                </label>
                                            </div>
                                        </div>

                                        <button type="submit" className="generate-plan-btn" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <Loader2 className="spinner" size={20} />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Brain size={20} />
                                                    Generate Plan
                                                </>
                                            )}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="generated-plan-preview">
                                        <div className="preview-success">
                                            <Award size={48} />
                                            <h3>Your Plan is Ready!</h3>
                                            <p>Review and save your personalized preparation plan</p>
                                        </div>

                                        <div className="preview-actions">
                                            <button
                                                className="btn-secondary"
                                                onClick={() => setGeneratedPlan(null)}
                                            >
                                                Regenerate
                                            </button>
                                            <button
                                                className="btn-primary"
                                                onClick={handleSavePlan}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="spinner" size={18} />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    'Save & Activate Plan'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* View Plan Modal */}
                {showPlanModal && selectedPlan && (
                    <div className={`modal-overlay-new ${modalAnimation}`} onClick={closePlanModal}>
                        <div
                            className={`modal-content-new view-modal ${modalAnimation}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header-new">
                                <div>
                                    <h2>
                                        <Target size={24} />
                                        {selectedPlan.subject} Plan
                                    </h2>
                                    <div className="plan-meta-row">
                                        <span><Clock size={14} /> {selectedPlan.duration}</span>
                                        <span><User size={14} /> {selectedPlan.experience}</span>
                                        <span><Briefcase size={14} /> {selectedPlan.company || 'Any'}</span>
                                    </div>
                                </div>
                                <button className="modal-close-btn-new" onClick={closePlanModal}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="modal-body-new plan-details-body">
                                {/* Progress Overview */}
                                <div className="progress-overview">
                                    <div className="progress-circle">
                                        <svg viewBox="0 0 100 100">
                                            <defs>
                                                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#6366f1" />
                                                    <stop offset="100%" stopColor="#8b5cf6" />
                                                </linearGradient>
                                            </defs>
                                            <circle cx="50" cy="50" r="45" className="progress-bg" />
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                className="progress-ring"
                                                style={{
                                                    stroke: 'url(#progress-gradient)',
                                                    strokeDasharray: `${calculateProgress(selectedPlan) * 2.827} 282.7`
                                                }}
                                            />
                                        </svg>
                                        <div className="progress-text">
                                            <span className="progress-number">{calculateProgress(selectedPlan)}%</span>
                                            <span className="progress-label">Complete</span>
                                        </div>
                                    </div>
                                    <div className="progress-stats">
                                        <div className="stat-item">
                                            <TrendingUp size={20} />
                                            <div>
                                                <span className="stat-value">On Track</span>
                                                <span className="stat-label">Status</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Aptitude Section */}
                                {selectedPlan.planDetails?.aptitude && selectedPlan.planDetails.aptitude.length > 0 && (
                                    <div className="plan-section-new">
                                        <h3>
                                            <Brain size={20} />
                                            Aptitude Rounds
                                        </h3>
                                        <div className="tasks-list">
                                            {selectedPlan.planDetails.aptitude.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className={`task-item ${item.competition ? 'completed' : ''}`}
                                                    onClick={() => toggleTaskCompletion('aptitude', index)}
                                                >
                                                    <div className="task-checkbox">
                                                        {item.competition ? (
                                                            <CheckCircle2 size={20} />
                                                        ) : (
                                                            <Circle size={20} />
                                                        )}
                                                    </div>
                                                    <div className="task-content">
                                                        <span className="task-topic">{item.topic}</span>
                                                        <span className="task-date">
                                                            <Calendar size={14} />
                                                            {item.date || 'TBD'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* DSA Section */}
                                {selectedPlan.planDetails?.dsa && selectedPlan.planDetails.dsa.length > 0 && (
                                    <div className="plan-section-new">
                                        <h3>
                                            <Code size={20} />
                                            DSA & Coding
                                        </h3>
                                        <div className="tasks-list">
                                            {selectedPlan.planDetails.dsa.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className={`task-item ${item.competition ? 'completed' : ''}`}
                                                    onClick={() => toggleTaskCompletion('dsa', index)}
                                                >
                                                    <div className="task-checkbox">
                                                        {item.competition ? (
                                                            <CheckCircle2 size={20} />
                                                        ) : (
                                                            <Circle size={20} />
                                                        )}
                                                    </div>
                                                    <div className="task-content">
                                                        <span className="task-topic">{item.topic}</span>
                                                        <span className="task-date">
                                                            <Calendar size={14} />
                                                            {item.date || 'TBD'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Subject Sections */}
                                {selectedPlan.planDetails?.subject && selectedPlan.planDetails.subject.map((sub, sIndex) => (
                                    <div key={sIndex} className="plan-section-new">
                                        <h3>
                                            <BookOpen size={20} />
                                            {sub.name}
                                        </h3>
                                        <div className="tasks-list">
                                            {sub.topics.map((item, tIndex) => (
                                                <div
                                                    key={tIndex}
                                                    className={`task-item ${item.competition ? 'completed' : ''}`}
                                                    onClick={() => toggleTaskCompletion('subject', sIndex, tIndex)}
                                                >
                                                    <div className="task-checkbox">
                                                        {item.competition ? (
                                                            <CheckCircle2 size={20} />
                                                        ) : (
                                                            <Circle size={20} />
                                                        )}
                                                    </div>
                                                    <div className="task-content">
                                                        <span className="task-topic">{item.topic}</span>
                                                        <span className="task-date">
                                                            <Calendar size={14} />
                                                            {item.date || 'TBD'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default PlansNew;
