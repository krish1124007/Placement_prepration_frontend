import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { planAPI } from '../services/api';
import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    Calendar,
    Target,
    Brain,
    Code,
    BookOpen,
    Loader2,
    TrendingUp,
    Award,
    Clock,
    User,
    Briefcase,
    Mic
} from 'lucide-react';
import './PlanRoadmap.css';

const PlanRoadmap = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPlanDetails();
    }, [id]);

    const fetchPlanDetails = async () => {
        try {
            setLoading(true);
            const response = await planAPI.getPlanDetails(id);
            if (response.status === 200 && response.data?.data) {
                setPlan(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching plan details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartInterview = async (task, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!user || !plan) {
            alert('User or plan not found');
            return;
        }

        try {
            setLoading(true);

            // Determine interview type based on task section
            const isDSA = task.section === 'dsa';
            const topic = task.topic || 'General Interview';
            const level = plan.experience || 'Mid-Level';

            console.log('Starting interview for task:', { topic, isDSA, section: task.section });

            // Store task info in localStorage to mark complete after interview
            const taskInfo = {
                planId: plan._id,
                section: task.section,
                index: task.index,
                subIndex: task.subIndex
            };
            localStorage.setItem('pendingTaskCompletion', JSON.stringify(taskInfo));

            if (isDSA) {
                // Create DSA interview
                console.log('Creating DSA interview...');
                const response = await fetch('http://localhost:8000/api/v1/dsa-interviews/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user._id,
                        topic: topic,
                        level: level
                    })
                });

                const data = await response.json();
                console.log('DSA interview response:', data);

                if ((data.success || data.status === 200 || data.status === 201) && data.data && data.data._id) {
                    console.log('Navigating to DSA interview:', data.data._id);
                    navigate(`/dsa-interview/${data.data._id}`);
                } else {
                    console.error('DSA Create Error: Response checks failed', { success: data.success, status: data.status, hasData: !!data.data, hasId: !!data?.data?._id });
                    throw new Error('Failed to create DSA interview');
                }
            } else {
                // Create normal interview
                console.log('Creating normal interview...');
                const response = await fetch('http://localhost:8000/api/v1/interviews/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user._id,
                        topic: topic,
                        description: `Interview for ${task.topic}`,
                        level: level,
                        tone: 'Professional'
                    })
                });

                const data = await response.json();
                console.log('Normal interview response:', data);

                if ((data.success || data.status === 200 || data.status === 201) && data.data && data.data._id) {
                    console.log('Navigating to normal interview:', data.data._id);
                    navigate(`/interview/${data.data._id}`);
                } else {
                    console.error('Normal Create Error: Response checks failed', { success: data.success, status: data.status, hasData: !!data.data, hasId: !!data?.data?._id });
                    throw new Error('Failed to create normal interview');
                }
            }
        } catch (error) {
            console.error('Failed to create interview:', error);
            alert('Failed to start interview. Please try again.');
            setLoading(false);
        }
    };

    const toggleTaskCompletion = async (section, index, subIndex = null) => {
        if (!plan) return;

        const planDetails = plan.planDetails;
        let currentStatus = false;

        if (section === 'aptitude' && planDetails.aptitude && planDetails.aptitude[index]) {
            currentStatus = planDetails.aptitude[index].competition || false;
        } else if (section === 'dsa' && planDetails.dsa && planDetails.dsa[index]) {
            currentStatus = planDetails.dsa[index].competition || false;
        } else if (section === 'subject' && planDetails.subject && planDetails.subject[index]) {
            if (subIndex !== null && planDetails.subject[index].topics && planDetails.subject[index].topics[subIndex]) {
                currentStatus = planDetails.subject[index].topics[subIndex].competition || false;
            }
        }

        try {
            const response = await planAPI.updateTaskCompletion(plan._id, {
                section,
                index,
                subIndex,
                completed: !currentStatus
            });

            if (response.status === 200) {
                // Update local state
                const updatedPlan = { ...plan };
                if (section === 'aptitude') {
                    updatedPlan.planDetails.aptitude[index].competition = !currentStatus;
                } else if (section === 'dsa') {
                    updatedPlan.planDetails.dsa[index].competition = !currentStatus;
                } else if (section === 'subject' && subIndex !== null) {
                    updatedPlan.planDetails.subject[index].topics[subIndex].competition = !currentStatus;
                }
                setPlan(updatedPlan);
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const calculateProgress = () => {
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

    // Collect all tasks in chronological order
    const getAllTasksInOrder = () => {
        if (!plan || !plan.planDetails) return [];

        const tasks = [];
        const details = plan.planDetails;

        if (details.aptitude) {
            details.aptitude.forEach((task, index) => {
                tasks.push({
                    ...task,
                    section: 'aptitude',
                    index,
                    type: 'Aptitude',
                    icon: Brain
                });
            });
        }

        if (details.dsa) {
            details.dsa.forEach((task, index) => {
                tasks.push({
                    ...task,
                    section: 'dsa',
                    index,
                    type: 'DSA',
                    icon: Code
                });
            });
        }

        if (details.subject) {
            details.subject.forEach((sub, sIndex) => {
                if (sub.topics) {
                    sub.topics.forEach((task, tIndex) => {
                        tasks.push({
                            ...task,
                            section: 'subject',
                            index: sIndex,
                            subIndex: tIndex,
                            type: sub.name,
                            icon: BookOpen
                        });
                    });
                }
            });
        }

        // Sort by date
        return tasks.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(a.date) - new Date(b.date);
        });
    };

    if (loading) {
        return (
            <div className="roadmap-loading">
                <Loader2 className="spinner" size={48} />
                <p>Loading your roadmap...</p>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="roadmap-error">
                <p>Plan not found</p>
                <button onClick={() => navigate('/plans')} className="back-btn">
                    <ArrowLeft size={20} />
                    Back to Plans
                </button>
            </div>
        );
    }

    const tasks = getAllTasksInOrder();
    const progress = calculateProgress();

    return (
        <div className="roadmap-container">
            {/* Header */}
            <div className="roadmap-header">
                <button onClick={() => navigate('/plans')} className="back-btn">
                    <ArrowLeft size={20} />
                    Back to Plans
                </button>
                <div className="roadmap-title-section">
                    <h1>Road to Success</h1>
                    <p className="roadmap-subtitle">{plan.subject} Journey</p>
                </div>
            </div>

            {/* Plan Info Banner */}
            <div className="plan-info-banner">
                <div className="banner-left">
                    <div className="plan-icon-large">
                        <Target size={32} />
                    </div>
                    <div>
                        <h2>{plan.subject}</h2>
                        <div className="plan-meta-banner">
                            <span><Clock size={16} /> {plan.duration}</span>
                            <span><User size={16} /> {plan.experience}</span>
                            <span><Briefcase size={16} /> {plan.company || 'Any Company'}</span>
                        </div>
                    </div>
                </div>
                <div className="banner-right">
                    <div className="progress-circle-large">
                        <svg viewBox="0 0 120 120">
                            <defs>
                                <linearGradient id="roadmap-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#2563eb" />
                                </linearGradient>
                            </defs>
                            <circle cx="60" cy="60" r="54" className="progress-bg-large" />
                            <circle
                                cx="60"
                                cy="60"
                                r="54"
                                className="progress-ring-large"
                                style={{
                                    stroke: 'url(#roadmap-gradient)',
                                    strokeDasharray: `${progress * 3.39} 339`
                                }}
                            />
                        </svg>
                        <div className="progress-text-large">
                            <span className="progress-number-large">{progress}%</span>
                        </div>
                    </div>
                    <div className="stats-mini">
                        <div className="stat-mini">
                            <TrendingUp size={20} />
                            <span>On Track</span>
                        </div>
                        <div className="stat-mini">
                            <Award size={20} />
                            <span>{tasks.filter(t => t.competition).length} / {tasks.length}</span>
                        </div>
                    </div>
                    <button
                        className="start-interview-btn"
                        onClick={handleStartInterview}
                        disabled={loading}
                    >
                        <Mic size={20} />
                        {loading ? 'Starting...' : 'Start Interview'}
                    </button>
                </div>
            </div>

            {/* Roadmap Path */}
            <div className="roadmap-path">
                {tasks.map((task, index) => {
                    const Icon = task.icon;
                    const isCompleted = task.competition;

                    // Assign different shapes based on task type
                    let shapeClass = 'shape-circle';
                    if (task.section === 'aptitude') shapeClass = 'shape-hexagon';
                    else if (task.section === 'dsa') shapeClass = 'shape-diamond';
                    else if (task.section === 'subject') shapeClass = 'shape-square';

                    return (
                        <div
                            key={`${task.section}-${task.index}-${task.subIndex || 0}`}
                            className={`roadmap-milestone ${isCompleted ? 'completed' : ''}`}
                        >
                            <div className="milestone-marker">
                                <div className="marker-number">{index + 1}</div>
                                <div className={`marker-icon ${shapeClass}`}>
                                    {isCompleted ? (
                                        <CheckCircle2 size={28} />
                                    ) : (
                                        <Icon size={28} />
                                    )}
                                </div>
                            </div>
                            <div className="milestone-content">
                                <div className="milestone-header">
                                    <div className="milestone-type">
                                        <Icon size={18} />
                                        <span>{task.type}</span>
                                    </div>
                                    <div className="milestone-date">
                                        <Calendar size={14} />
                                        <span>{task.date || 'TBD'}</span>
                                    </div>
                                </div>
                                <h3 className="milestone-title">{task.topic}</h3>
                                {isCompleted ? (
                                    <div className="completion-badge">
                                        <CheckCircle2 size={16} />
                                        Completed
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className="task-interview-btn"
                                        onClick={(e) => handleStartInterview(task, e)}
                                        disabled={loading}
                                    >
                                        <Mic size={16} />
                                        {loading ? 'Starting...' : 'Start Interview'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Success Flag */}
                <div className="success-flag">
                    <div className="flag-pole"></div>
                    <div className="flag-content">
                        <Award size={32} />
                        <h3>Success!</h3>
                        <p>Complete all milestones to reach your goal</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanRoadmap;
