import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewAPI } from '../services/api';
import { X, Mic, ArrowRight, Code } from 'lucide-react';
import './InterviewSetupModal.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://placement-prepration-backend.onrender.com/api/v1';

const InterviewSetupModal = ({ isOpen, onClose, prefillData = null }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        topic: prefillData?.topic || '',
        description: prefillData?.description || '',
        level: prefillData?.level || 'Mid-Level',
        interviewType: prefillData?.interviewType || 'normal' // 'normal' or 'dsa'
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.topic) {
            alert('Please enter an interview topic');
            return;
        }

        setLoading(true);
        try {
            if (formData.interviewType === 'dsa') {
                // Create DSA interview session
                const response = await fetch(`${API_BASE_URL}/dsa-interviews/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user._id,
                        topic: formData.topic,
                        level: formData.level
                    })
                });

                const data = await response.json();

                if (data.success) {
                    navigate(`/dsa-interview/${data.data._id}`);
                }
            } else {
                // Create normal interview session
                const response = await interviewAPI.createSession({
                    userId: user._id,
                    topic: formData.topic,
                    description: formData.description,
                    level: formData.level,
                    tone: 'Professional'
                });

                if (response.data) {
                    navigate(`/interview/${response.data._id}`);
                }
            }
        } catch (error) {
            console.error('Failed to create interview session:', error);
            alert('Failed to create interview session. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="modal-header">
                    <div className="modal-icon">
                        <Mic size={32} />
                    </div>
                    <h2>Quick Interview Setup</h2>
                    <p>Configure your AI-powered mock interview session</p>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="interviewType">Interview Type *</label>
                        <select
                            id="interviewType"
                            name="interviewType"
                            value={formData.interviewType}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option value="normal">Normal Interview</option>
                            <option value="dsa">DSA Interview</option>
                        </select>
                        <small className="form-hint">
                            {formData.interviewType === 'dsa'
                                ? 'DSA interviews include preliminary questions and coding challenges'
                                : 'Normal interviews are conversational with the AI interviewer'}
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="topic">Interview Topic / Position *</label>
                        <input
                            type="text"
                            id="topic"
                            name="topic"
                            value={formData.topic}
                            onChange={handleChange}
                            placeholder={formData.interviewType === 'dsa' ? 'e.g., Arrays, Trees, Graphs' : 'e.g., Frontend Developer, Data Scientist'}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description (Optional)</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Add any specific topics or areas you want to focus on..."
                            rows="3"
                            disabled={loading || formData.interviewType === 'dsa'}
                        />
                        {formData.interviewType === 'dsa' && (
                            <small className="form-hint">Description not needed for DSA interviews</small>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="level">Experience Level *</label>
                        <select
                            id="level"
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option value="Junior">Junior</option>
                            <option value="Mid-Level">Mid-Level</option>
                            <option value="Senior">Senior</option>
                            <option value="Expert">Expert</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="modal-submit-button"
                        disabled={loading}
                    >
                        {loading ? (
                            'Creating Session...'
                        ) : (
                            <>
                                Start Interview <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InterviewSetupModal;
