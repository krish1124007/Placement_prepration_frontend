import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { planAPI } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import {
    ClipboardList,
    Plus,
    Save,
    Trash2,
    Edit2,
    Check,
    X,
    Calendar,
    Code,
    BookOpen,
    Loader2,
    RefreshCw,
    Brain,
    Clock,
    Target,
    User,
    Briefcase,
    Languages
} from 'lucide-react';
import './Plans.css';

const Plans = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('create');
    const [loading, setLoading] = useState(false);
    const [myPlans, setMyPlans] = useState([]);
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [planPayload, setPlanPayload] = useState(null);
    const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
    const [modalAnimation, setModalAnimation] = useState('enter');

    const [formData, setFormData] = useState({
        subject: '',
        duration: '',
        experience: 'Fresher',
        company: 'Any',
        companyInterviewInsights: '',
        isGithubUse: true,
        language: 'English',
        planguage: 'JavaScript',
        dsa: true,
        aptitude: true,
        interview: true,
        projects: true
    });

    const [editingItem, setEditingItem] = useState(null);
    const [editValue, setEditValue] = useState({ date: '', topic: '' });

    useEffect(() => {
        if (activeTab === 'my-plans') {
            fetchMyPlans();
        }
    }, [activeTab]);

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

    const openPlanDetails = async (id) => {
        try {
            setLoading(true);
            const response = await planAPI.getPlanDetails(id);
            if (response.status === 200 && response.data?.data) {
                setSelectedPlanDetails(response.data.data);
                setModalAnimation('enter');
            } else {
                console.error('Unexpected response for plan details:', response);
            }
        } catch (error) {
            console.error('Error fetching plan details:', error);
        } finally {
            setLoading(false);
        }
    };

    const closePlanDetails = () => {
        setModalAnimation('exit');
        setTimeout(() => {
            setSelectedPlanDetails(null);
        }, 300);
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                experice: formData.experience,
                language: formData.language,
                planguage: formData.planguage
            };

            setPlanPayload(payload);

            const response = await planAPI.createPlan(payload);

            if (response.status === 200) {
                let planData = response.data?.data;

                if (typeof planData === 'string') {
                    try {
                        const cleanJson = planData.replace(/```json\n?|\n?```/g, '');
                        planData = JSON.parse(cleanJson);
                    } catch (e) {
                        try {
                            const firstBrace = planData.indexOf('{');
                            const lastBrace = planData.lastIndexOf('}');
                            if (firstBrace !== -1 && lastBrace !== -1) {
                                const jsonStr = planData.substring(firstBrace, lastBrace + 1);
                                planData = JSON.parse(jsonStr);
                            } else {
                                throw new Error('No JSON object found');
                            }
                        } catch (err) {
                            console.error('Failed to parse plan JSON:', err);
                            return;
                        }
                    }
                }
                setGeneratedPlan(planData);
            }
        } catch (error) {
            console.error('Error generating plan:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async () => {
        if (!generatedPlan || !planPayload) return;

        setLoading(true);
        try {
            await planAPI.savePlan(planPayload, generatedPlan);
            setGeneratedPlan(null);
            setPlanPayload(null);
            setActiveTab('my-plans');
        } catch (error) {
            console.error('Error saving plan:', error);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (section, index, item, subIndex = null) => {
        setEditingItem({ section, index, subIndex });
        setEditValue({
            date: item.date || '',
            topic: item.topic || ''
        });
    };

    const saveEdit = (section, index, subIndex = null) => {
        const newPlan = { ...generatedPlan };

        if (section === 'subject') {
            newPlan.subject[index].topics[subIndex] = {
                ...newPlan.subject[index].topics[subIndex],
                ...editValue
            };
        } else {
            newPlan[section][index] = {
                ...newPlan[section][index],
                ...editValue
            };
        }

        setGeneratedPlan(newPlan);
        setEditingItem(null);
    };

    const deleteItem = (section, index, subIndex = null) => {
        const newPlan = { ...generatedPlan };

        if (section === 'subject') {
            newPlan.subject[index].topics.splice(subIndex, 1);
        } else {
            newPlan[section].splice(index, 1);
        }

        setGeneratedPlan(newPlan);
    };

    const renderPlanItem = (item, section, index, subIndex = null) => {
        const isEditing = editingItem?.section === section &&
            editingItem?.index === index &&
            editingItem?.subIndex === subIndex;

        if (isEditing) {
            return (
                <div className="item-edit-form">
                    <input
                        type="date"
                        value={editValue.date}
                        onChange={(e) => setEditValue({ ...editValue, date: e.target.value })}
                        className="item-input"
                    />
                    <input
                        type="text"
                        value={editValue.topic}
                        onChange={(e) => setEditValue({ ...editValue, topic: e.target.value })}
                        className="item-input"
                        placeholder="Topic"
                        autoFocus
                    />
                    <button className="icon-btn save" onClick={() => saveEdit(section, index, subIndex)}>
                        <Check size={18} />
                    </button>
                    <button className="icon-btn cancel" onClick={() => setEditingItem(null)}>
                        <X size={18} />
                    </button>
                </div>
            );
        }

        return (
            <div className="item-content">
                <div className="item-main">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="item-date">{item.date || 'TBD'}</span>
                    </div>
                    <span className="item-topic">{item.topic}</span>
                </div>
                <div className="item-actions">
                    <button
                        className="edit-btn"
                        onClick={() => startEditing(section, index, item, subIndex)}
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        className="delete-btn"
                        onClick={() => deleteItem(section, index, subIndex)}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="plans-container">
                <div className="plans-header">
                    <div>
                        <h1>Placement Plans</h1>
                        <p>Generate personalized AI study plans tailored to your goals</p>
                    </div>
                </div>

                <div className="plans-tabs">
                    <button
                        className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        <Plus size={18} /> Create New
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'my-plans' ? 'active' : ''}`}
                        onClick={() => setActiveTab('my-plans')}
                    >
                        <ClipboardList size={18} /> My Plans
                    </button>
                </div>

                {activeTab === 'create' && !generatedPlan && (
                    <div className="create-plan-card animate-slide-up">
                        <form onSubmit={handleGenerate}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Target Role / Subject</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Full Stack Developer"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Target Company</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Google, Amazon (Optional)"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Duration</label>
                                    <select
                                        className="form-select"
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
                                <div className="form-group">
                                    <label>Experience Level</label>
                                    <select
                                        className="form-select"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    >
                                        <option value="Fresher">Fresher (0-1 years)</option>
                                        <option value="Junior">Junior (1-3 years)</option>
                                        <option value="Mid">Mid-Level (3-5 years)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Primary Programming Language</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. JavaScript, Python, Java"
                                        value={formData.planguage}
                                        onChange={(e) => setFormData({ ...formData, planguage: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Interview Language</label>
                                    <select
                                        className="form-select"
                                        value={formData.language}
                                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                    >
                                        <option value="English">English</option>
                                        <option value="Hinglish">Hinglish</option>
                                        <option value="Hindi">Hindi</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group mt-6">
                                <label>Included Modules</label>
                                <div className="toggles-grid">
                                    <label className="toggle-item">
                                        <input
                                            type="checkbox"
                                            checked={formData.dsa}
                                            onChange={(e) => setFormData({ ...formData, dsa: e.target.checked })}
                                            hidden
                                        />
                                        <div className="toggle-switch"></div>
                                        <span>DSA Rounds</span>
                                    </label>
                                    <label className="toggle-item">
                                        <input
                                            type="checkbox"
                                            checked={formData.aptitude}
                                            onChange={(e) => setFormData({ ...formData, aptitude: e.target.checked })}
                                            hidden
                                        />
                                        <div className="toggle-switch"></div>
                                        <span>Aptitude Tests</span>
                                    </label>
                                    <label className="toggle-item">
                                        <input
                                            type="checkbox"
                                            checked={formData.interview}
                                            onChange={(e) => setFormData({ ...formData, interview: e.target.checked })}
                                            hidden
                                        />
                                        <div className="toggle-switch"></div>
                                        <span>Tech Interviews</span>
                                    </label>
                                    <label className="toggle-item">
                                        <input
                                            type="checkbox"
                                            checked={formData.isGithubUse}
                                            onChange={(e) => setFormData({ ...formData, isGithubUse: e.target.checked })}
                                            hidden
                                        />
                                        <div className="toggle-switch"></div>
                                        <span>Analyze GitHub</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="generate-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" /> Generating Plan...
                                    </>
                                ) : (
                                    <>
                                        <Brain /> Generate AI Plan
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'create' && generatedPlan && (
                    <div className="plan-preview animate-slide-up">
                        <div className="preview-header">
                            <h2>Your Personalized Plan</h2>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    if (confirm('Are you sure? Unsaved changes will be lost.')) {
                                        setGeneratedPlan(null);
                                    }
                                }}
                            >
                                <RefreshCw size={18} /> Regenerate
                            </button>
                        </div>

                        {generatedPlan.aptitude && generatedPlan.aptitude.length > 0 && (
                            <div className="plan-section">
                                <h3><Brain size={20} /> Aptitude Rounds</h3>
                                <div className="timeline-container">
                                    {generatedPlan.aptitude.map((item, index) => (
                                        <div key={index} className="timeline-item">
                                            <div className="timeline-dot"></div>
                                            {renderPlanItem(item, 'aptitude', index)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {generatedPlan.dsa && generatedPlan.dsa.length > 0 && (
                            <div className="plan-section">
                                <h3><Code size={20} /> DSA & Coding</h3>
                                <div className="timeline-container">
                                    {generatedPlan.dsa.map((item, index) => (
                                        <div key={index} className="timeline-item">
                                            <div className="timeline-dot"></div>
                                            {renderPlanItem(item, 'dsa', index)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {generatedPlan.subject && generatedPlan.subject.map((sub, sIndex) => (
                            <div key={sIndex} className="plan-section">
                                <h3><BookOpen size={20} /> {sub.name}</h3>
                                <div className="timeline-container">
                                    {sub.topics.map((item, tIndex) => (
                                        <div key={tIndex} className="timeline-item">
                                            <div className="timeline-dot"></div>
                                            {renderPlanItem(item, 'subject', sIndex, tIndex)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="plan-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setGeneratedPlan(null)}
                            >
                                Discard
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSavePlan}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                Save & Activate Plan
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'my-plans' && (
                    <div className="animate-slide-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading && !myPlans.length ? (
                                <div className="col-span-full text-center py-12">
                                    <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-purple-500" />
                                    <p className="text-slate-400">Loading plans...</p>
                                </div>
                            ) : myPlans.length > 0 ? (
                                myPlans.map((plan) => (
                                    <div
                                        key={plan._id}
                                        className="plan-card group relative"
                                        onClick={() => openPlanDetails(plan._id)}
                                    >
                                        <div className="plan-date-badge">
                                            {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            }) : 'Just now'}
                                        </div>

                                        <div className="plan-card-header">
                                            <h3 className="plan-title">{plan.subject}</h3>
                                            <div className="plan-meta">
                                                <div className="meta-pill">
                                                    <Clock size={14} className="text-purple-400" />
                                                    <span>{plan.duration}</span>
                                                </div>
                                                <div className="meta-pill">
                                                    <User size={14} className="text-blue-400" />
                                                    <span>{plan.experience}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="plan-card-content">
                                            <div className="company-info">
                                                <Briefcase size={18} className="text-slate-400" />
                                                <div>
                                                    <span className="company-label">Target Company</span>
                                                    <span className="company-name">{plan.company || 'Global Opportunities'}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-4 px-2">
                                                <Languages size={14} className="text-slate-500" />
                                                <span className="text-xs text-slate-400 font-medium">
                                                    {Array.isArray(plan.language) ? plan.language.join(', ') : plan.language}
                                                </span>
                                            </div>

                                            <div className="plan-tags">
                                                {plan.dsa && <span className="plan-tag tag-dsa">DSA</span>}
                                                {plan.aptitude && <span className="plan-tag tag-aptitude">Aptitude</span>}
                                                {plan.interview && <span className="plan-tag tag-interview">Interviews</span>}
                                                {plan.isGithubUse && <span className="plan-tag tag-github">GitHub</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full empty-state">
                                    <ClipboardList className="empty-icon" />
                                    <h3 className="empty-title">No plans found</h3>
                                    <p className="empty-text">Create a new plan to get started with your preparation journey.</p>
                                    <button
                                        className="btn btn-primary mt-4"
                                        onClick={() => setActiveTab('create')}
                                    >
                                        Create First Plan
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Plan Details Modal */}
                {selectedPlanDetails && (
                    <div className={`modal-overlay ${modalAnimation}`} onClick={closePlanDetails}>
                        <div
                            className={`modal-content ${modalAnimation}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <div className="modal-header-content">
                                    <div className="flex items-center gap-3">
                                        <div className="modal-icon-bg">
                                            <Target size={24} className="modal-icon" />
                                        </div>
                                        <div>
                                            <h2 className="modal-title">{selectedPlanDetails.subject} Plan</h2>
                                            <div className="modal-subtitle">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} /> {selectedPlanDetails.duration}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <User size={14} /> {selectedPlanDetails.experience}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Briefcase size={14} /> {selectedPlanDetails.company || 'Any'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closePlanDetails}
                                        className="modal-close-btn"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="modal-body">
                                {selectedPlanDetails.planDetails?.aptitude && selectedPlanDetails.planDetails.aptitude.length > 0 && (
                                    <div className="modal-section">
                                        <h3 className="modal-section-title">
                                            <Brain size={20} /> Aptitude Rounds
                                        </h3>
                                        <div className="modal-timeline">
                                            {selectedPlanDetails.planDetails.aptitude.map((item, index) => (
                                                <div key={index} className="modal-timeline-item">
                                                    <div className="modal-timeline-dot bg-purple-500"></div>
                                                    <div className="modal-timeline-content">
                                                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                                                            <Calendar size={14} />
                                                            <span>{item.date || 'TBD'}</span>
                                                        </div>
                                                        <p className="modal-timeline-text">{item.topic}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedPlanDetails.planDetails?.dsa && selectedPlanDetails.planDetails.dsa.length > 0 && (
                                    <div className="modal-section">
                                        <h3 className="modal-section-title">
                                            <Code size={20} /> DSA & Coding
                                        </h3>
                                        <div className="modal-timeline">
                                            {selectedPlanDetails.planDetails.dsa.map((item, index) => (
                                                <div key={index} className="modal-timeline-item">
                                                    <div className="modal-timeline-dot bg-blue-500"></div>
                                                    <div className="modal-timeline-content">
                                                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                                                            <Calendar size={14} />
                                                            <span>{item.date || 'TBD'}</span>
                                                        </div>
                                                        <p className="modal-timeline-text">{item.topic}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedPlanDetails.planDetails?.subject && selectedPlanDetails.planDetails.subject.map((sub, sIndex) => (
                                    <div key={sIndex} className="modal-section">
                                        <h3 className="modal-section-title">
                                            <BookOpen size={20} /> {sub.name}
                                        </h3>
                                        <div className="modal-timeline">
                                            {sub.topics.map((item, tIndex) => (
                                                <div key={tIndex} className="modal-timeline-item">
                                                    <div className="modal-timeline-dot bg-green-500"></div>
                                                    <div className="modal-timeline-content">
                                                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                                                            <Calendar size={14} />
                                                            <span>{item.date || 'TBD'}</span>
                                                        </div>
                                                        <p className="modal-timeline-text">{item.topic}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {(!selectedPlanDetails.planDetails?.aptitude?.length &&
                                    !selectedPlanDetails.planDetails?.dsa?.length &&
                                    !selectedPlanDetails.planDetails?.subject) && (
                                        <div className="empty-modal-section">
                                            <ClipboardList className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-white mb-2">No Plan Details Available</h3>
                                            <p className="text-slate-400">This plan doesn't contain detailed study items.</p>
                                        </div>
                                    )}
                            </div>

                            <div className="modal-footer">
                                <div className="flex gap-3">
                                    <button
                                        onClick={closePlanDetails}
                                        className="btn btn-secondary"
                                    >
                                        Close
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            // Add functionality to use this plan
                                            console.log('Use this plan:', selectedPlanDetails._id);
                                        }}
                                    >
                                        Use This Plan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Plans;