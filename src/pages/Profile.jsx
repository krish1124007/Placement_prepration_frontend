import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import {
    User, Mail, Briefcase, Calendar, Github, Linkedin,
    Code, Award, Heart, BookOpen, ExternalLink, Edit2,
    Save, X, Sparkles, CheckCircle, AlertCircle, Loader,
    Download, Globe
} from 'lucide-react';
import './Profile.css';

// Helper function for language colors
const getLanguageColor = (language) => {
    const colors = {
        JavaScript: '#f1e05a',
        TypeScript: '#3178c6',
        Python: '#3572A5',
        Java: '#b07219',
        'C++': '#f34b7d',
        C: '#555555',
        'C#': '#178600',
        Go: '#00ADD8',
        Rust: '#dea584',
        Ruby: '#701516',
        PHP: '#4F5D95',
        Swift: '#F05138',
        Kotlin: '#A97BFF',
        Dart: '#00B4AB',
        HTML: '#e34c26',
        CSS: '#563d7c',
        Vue: '#41b883',
        React: '#61dafb',
        Shell: '#89e051',
    };
    return colors[language] || '#000000';
};

const Profile = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [githubRepos, setGithubRepos] = useState([]);
    const [loadingRepos, setLoadingRepos] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        branch: '',
        passing_year: '',
        image: '',
        about: '',
        sem: '',
        github: '',
        linkedin: '',
        leetcode: '',
        projects: [],
        skills: [],
        achievements: [],
        interests: [],
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                branch: user.branch || '',
                passing_year: user.passing_year || '',
                image: user.image || '',
                about: user.about || '',
                sem: user.sem || '',
                github: user.github || '',
                linkedin: user.linkedin || '',
                leetcode: user.leetcode || '',
                projects: user.projects || [],
                skills: user.skills || [],
                achievements: user.achievements || [],
                interests: user.interests || [],
            });

            // Fetch GitHub repos if connected
            if (user.githubId) {
                fetchGithubRepos();
            }
        }
    }, [user]);

    const fetchGithubRepos = async () => {
        try {
            setLoadingRepos(true);
            console.log(user);  
            const response = await userAPI.getGithubRepos(user._id);
            if (response.data?.repos) {
                setGithubRepos(response.data.repos.slice(0, 6)); // Show top 6 repos
            }
        } catch (err) {
            console.error('Failed to fetch GitHub repos:', err);
        } finally {
            setLoadingRepos(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setError('');
        setSuccess('');
    };

    const handleArrayChange = (e, field) => {
        const value = e.target.value;
        const array = value.split(',').map(item => item.trim()).filter(item => item);
        setFormData({
            ...formData,
            [field]: array,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            console.log(user);
            const response = await userAPI.editUser(user._id || user._doc._id, formData);
            
            if (response.status === 200 && response.data) {
                updateUser(response.data);
                setSuccess('Profile updated successfully!');
                setIsEditing(false);

                setTimeout(() => setSuccess(''), 5000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                name: user.name || '',
                branch: user.branch || '',
                passing_year: user.passing_year || '',
                image: user.image || '',
                about: user.about || '',
                sem: user.sem || '',
                github: user.github || '',
                linkedin: user.linkedin || '',
                leetcode: user.leetcode || '',
                projects: user.projects || [],
                skills: user.skills || [],
                achievements: user.achievements || [],
                interests: user.interests || [],
            });
        }
        setIsEditing(false);
        setError('');
        setSuccess('');
    };

    const handleConnectGithub = () => {
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        const redirectUri = `${window.location.origin}/github-callback`;
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user,repo`;

        window.location.href = githubAuthUrl;
    };

    const handleDisconnectGithub = async () => {
        try {
            await userAPI.disconnectGithub(user._id);
            setGithubRepos([]);
            // Refresh user data
            const updatedUser = await userAPI.getUser(user._id);
            updateUser(updatedUser.data);
            setSuccess('GitHub disconnected successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to disconnect GitHub');
        }
    };

    const handleDownloadResume = async () => {
        try {
            // Import resume utility
            const { generateResumePDF } = await import('../utils/resumeGenerator');
            await generateResumePDF(user);
            setSuccess('Resume downloaded successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to download resume. Please try again.');
            console.error('Resume download error:', err);
        }
    };

    const handleOpenPortfolio = () => {
        const username = user?.githubUsername || user?.email?.split('@')[0] || user?.name?.toLowerCase().replace(/\s+/g, '');
        const userId = user?._id;
        if (username && userId) {
            navigate(`/portfolio/${username}/${userId}`);
        } else {
            setError('Unable to generate portfolio URL. Please ensure your profile is complete.');
        }
    };

    return (
        <div className="profile-container">
            <nav className="profile-nav">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
            </nav>

            <div className="profile-content">
                {/* Hero Section */}
                <div className="profile-hero">
                    <div className="profile-hero-bg"></div>
                    <div className="profile-hero-content">
                        <div className="profile-avatar-container">
                            <div className="profile-avatar-large">
                                {formData.image ? (
                                    <img src={formData.image} alt={formData.name} />
                                ) : (
                                    <div className="avatar-placeholder-large">
                                        {formData.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="avatar-badge">
                                <Sparkles size={16} />
                            </div>
                        </div>
                        <div className="profile-hero-info">
                            <h1 className="profile-name">{user?.name}</h1>
                            <div className="profile-meta">
                                <span className="profile-email">
                                    <Mail size={16} />
                                    {user?.email}
                                </span>
                                <span className="profile-role-badge">
                                    {user?.role}
                                </span>
                            </div>
                            {user?.branch && (
                                <div className="profile-quick-info">
                                    <span><Briefcase size={14} /> {user.branch}</span>
                                    {user?.sem && <span>Semester {user.sem}</span>}
                                    {user?.passing_year && (
                                        <span><Calendar size={14} /> {user.passing_year}</span>
                                    )}
                                </div>
                            )}
                        </div>
                        {!isEditing && (
                            <div className="profile-actions">
                                <button onClick={() => setIsEditing(true)} className="edit-profile-btn">
                                    <Edit2 size={18} />
                                    Edit Profile
                                </button>
                                <button onClick={handleDownloadResume} className="download-resume-btn">
                                    <Download size={18} />
                                    Download Resume
                                </button>
                                <button onClick={handleOpenPortfolio} className="open-portfolio-btn">
                                    <Globe size={18} />
                                    Open Portfolio
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Alert Messages */}
                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div className="alert alert-success">
                        <CheckCircle size={20} />
                        <span>{success}</span>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="profile-grid">
                    {/* Left Column */}
                    <div className="profile-left">
                        {/* About Section */}
                        {!isEditing && user?.about && (
                            <div className="info-card">
                                <h3 className="card-title">
                                    <BookOpen size={20} />
                                    About
                                </h3>
                                <p className="about-text">{user.about}</p>
                            </div>
                        )}

                        {/* Skills */}
                        {!isEditing && formData.skills.length > 0 && (
                            <div className="info-card">
                                <h3 className="card-title">
                                    <Code size={20} />
                                    Skills
                                </h3>
                                <div className="skills-grid">
                                    {formData.skills.map((skill, index) => (
                                        <span key={index} className="skill-badge">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Achievements */}
                        {!isEditing && formData.achievements.length > 0 && (
                            <div className="info-card">
                                <h3 className="card-title">
                                    <Award size={20} />
                                    Achievements
                                </h3>
                                <ul className="achievement-list">
                                    {formData.achievements.map((achievement, index) => (
                                        <li key={index} className="achievement-item">
                                            <CheckCircle size={16} />
                                            <span>{achievement}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Interests */}
                        {!isEditing && formData.interests.length > 0 && (
                            <div className="info-card">
                                <h3 className="card-title">
                                    <Heart size={20} />
                                    Interests
                                </h3>
                                <div className="interests-grid">
                                    {formData.interests.map((interest, index) => (
                                        <span key={index} className="interest-tag">
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="profile-right">
                        {/* Social Links */}
                        {!isEditing && (
                            <div className="info-card">
                                <h3 className="card-title">Connect</h3>
                                <div className="social-links">
                                    {formData.github && (
                                        <a href={formData.github} target="_blank" rel="noopener noreferrer" className="social-link github-link">
                                            <Github size={20} />
                                            <span>GitHub</span>
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                    {formData.linkedin && (
                                        <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin-link">
                                            <Linkedin size={20} />
                                            <span>LinkedIn</span>
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                    {formData.leetcode && (
                                        <a href={formData.leetcode} target="_blank" rel="noopener noreferrer" className="social-link leetcode-link">
                                            <Code size={20} />
                                            <span>LeetCode</span>
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {!isEditing && formData.projects.length > 0 && (
                            <div className="info-card">
                                <h3 className="card-title">
                                    <Briefcase size={20} />
                                    Projects
                                </h3>
                                <div className="projects-list">
                                    {formData.projects.map((project, index) => (
                                        <div key={index} className="project-item">
                                            <div className="project-icon">💼</div>
                                            <span>{project}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* GitHub Repos */}
                        {!isEditing && user?.githubId && (
                            <div className="info-card github-section">
                                <div className="github-header">
                                    <div className="github-header-left">
                                        <div className="github-title-row">
                                            <Github size={24} />
                                            <div>
                                                <h3 className="github-title">GitHub</h3>
                                                {user?.githubUsername && (
                                                    <a
                                                        href={`https://github.com/${user.githubUsername}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="github-username"
                                                    >
                                                        @{user.githubUsername}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={handleDisconnectGithub} className="btn-disconnect">
                                        <X size={14} />
                                        Disconnect
                                    </button>
                                </div>

                                {/* GitHub Stats */}
                                <div className="github-stats">
                                    <div className="stat-item">
                                        <div className="stat-value">{githubRepos.length > 0 ? githubRepos.length : user?.githubRepos?.length || 0}</div>
                                        <div className="stat-label">Repositories</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">
                                            {githubRepos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0)}
                                        </div>
                                        <div className="stat-label">Total Stars</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">
                                            {githubRepos.reduce((acc, repo) => acc + (repo.forks_count || 0), 0)}
                                        </div>
                                        <div className="stat-label">Total Forks</div>
                                    </div>
                                </div>

                                <div className="repos-section">
                                    <div className="repos-header">
                                        <h4 className="repos-subtitle">Top Repositories</h4>
                                        {user?.githubUsername && (
                                            <a
                                                href={`https://github.com/${user.githubUsername}?tab=repositories`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="view-all-link"
                                            >
                                                View All
                                                <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>

                                    {loadingRepos ? (
                                        <div className="loading-state">
                                            <Loader className="spinner" size={24} />
                                            <span>Loading repositories...</span>
                                        </div>
                                    ) : githubRepos.length > 0 ? (
                                        <div className="repos-grid">
                                            {githubRepos.map((repo, index) => (
                                                <a
                                                    key={index}
                                                    href={repo.html_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="repo-card"
                                                >
                                                    <div className="repo-header">
                                                        <span className="repo-name">
                                                            <BookOpen size={16} />
                                                            {repo.name}
                                                        </span>
                                                        {repo.private && (
                                                            <span className="repo-private-badge">Private</span>
                                                        )}
                                                    </div>
                                                    {repo.description && (
                                                        <p className="repo-description">{repo.description}</p>
                                                    )}
                                                    <div className="repo-stats">
                                                        {repo.language && (
                                                            <span className="repo-stat">
                                                                <span className="language-dot" style={{
                                                                    background: getLanguageColor(repo.language)
                                                                }}></span>
                                                                {repo.language}
                                                            </span>
                                                        )}
                                                        <span className="repo-stat">
                                                            <span className="stat-icon">⭐</span>
                                                            {repo.stargazers_count}
                                                        </span>
                                                        <span className="repo-stat">
                                                            <span className="stat-icon">🍴</span>
                                                            {repo.forks_count || 0}
                                                        </span>
                                                    </div>
                                                    <div className="repo-updated">
                                                        Updated {new Date(repo.updated_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-state-box">
                                            <BookOpen size={32} />
                                            <p className="empty-state-title">No repositories yet</p>
                                            <p className="empty-state-text">
                                                Start building amazing projects and they'll show up here!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Connect GitHub CTA */}
                        {!isEditing && !user?.githubId && (
                            <div className="info-card github-cta">
                                <Github size={32} />
                                <h4>Connect GitHub</h4>
                                <p>Showcase your repositories and contributions</p>
                                <button onClick={handleConnectGithub} className="btn-connect-github">
                                    <Github size={18} />
                                    Connect GitHub
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Form */}
                {isEditing && (
                    <form onSubmit={handleSubmit} className="edit-form">
                        <div className="info-card">
                            <h3 className="card-title">Basic Information</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="name">Full Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="branch">Branch *</label>
                                    <input
                                        type="text"
                                        id="branch"
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., Computer Science"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="sem">Semester *</label>
                                    <input
                                        type="text"
                                        id="sem"
                                        name="sem"
                                        value={formData.sem}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., 6"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="passing_year">Passing Year *</label>
                                    <input
                                        type="text"
                                        id="passing_year"
                                        name="passing_year"
                                        value={formData.passing_year}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., 2024"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="image">Profile Image URL *</label>
                                    <input
                                        type="url"
                                        id="image"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        required
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="about">About *</label>
                                    <textarea
                                        id="about"
                                        name="about"
                                        value={formData.about}
                                        onChange={handleChange}
                                        required
                                        rows="4"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="info-card">
                            <h3 className="card-title">Social Links</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="github">GitHub Profile</label>
                                    <input
                                        type="url"
                                        id="github"
                                        name="github"
                                        value={formData.github}
                                        onChange={handleChange}
                                        placeholder="https://github.com/username"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="linkedin">LinkedIn Profile</label>
                                    <input
                                        type="url"
                                        id="linkedin"
                                        name="linkedin"
                                        value={formData.linkedin}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="leetcode">LeetCode Profile</label>
                                    <input
                                        type="url"
                                        id="leetcode"
                                        name="leetcode"
                                        value={formData.leetcode}
                                        onChange={handleChange}
                                        placeholder="https://leetcode.com/username"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="info-card">
                            <h3 className="card-title">Additional Information</h3>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label htmlFor="skills">Skills (comma-separated)</label>
                                    <textarea
                                        id="skills"
                                        value={formData.skills.join(', ')}
                                        onChange={(e) => handleArrayChange(e, 'skills')}
                                        placeholder="JavaScript, React, Node.js, Python, etc."
                                        rows="3"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="projects">Projects (comma-separated)</label>
                                    <textarea
                                        id="projects"
                                        value={formData.projects.join(', ')}
                                        onChange={(e) => handleArrayChange(e, 'projects')}
                                        placeholder="E-commerce Platform, Chat Application, etc."
                                        rows="3"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="achievements">Achievements (comma-separated)</label>
                                    <textarea
                                        id="achievements"
                                        value={formData.achievements.join(', ')}
                                        onChange={(e) => handleArrayChange(e, 'achievements')}
                                        placeholder="Hackathon Winner, Published Research, etc."
                                        rows="3"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="interests">Interests (comma-separated)</label>
                                    <textarea
                                        id="interests"
                                        value={formData.interests.join(', ')}
                                        onChange={(e) => handleArrayChange(e, 'interests')}
                                        placeholder="Web Development, AI/ML, Mobile Apps, etc."
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={handleCancel} className="btn-cancel" disabled={loading}>
                                <X size={18} />
                                Cancel
                            </button>
                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader className="spinner" size={18} />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;
