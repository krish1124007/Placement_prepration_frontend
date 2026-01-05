import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import {
    User, Mail, Briefcase, Calendar, Github, Linkedin,
    Code, Award, Heart, BookOpen, ExternalLink, Loader,
    AlertCircle, ArrowLeft
} from 'lucide-react';
import './Portfolio.css';

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

const Portfolio = () => {
    const { username, userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [githubRepos, setGithubRepos] = useState([]);
    const [loadingRepos, setLoadingRepos] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Try to fetch user by ID (public endpoint)
            const response = await userAPI.getUserPublic(userId);
            if (response.data) {
                setUser(response.data);
                
                // Use cached GitHub repos if available (public endpoint doesn't require auth)
                if (response.data.githubRepos && response.data.githubRepos.length > 0) {
                    setGithubRepos(response.data.githubRepos.slice(0, 6));
                }
            }
        } catch (err) {
            console.error('Failed to fetch user:', err);
            setError('Portfolio not found. The user may not exist or the link is invalid.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="portfolio-loading">
                <Loader className="spinner" size={48} />
                <p>Loading portfolio...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="portfolio-error">
                <AlertCircle size={48} />
                <h2>Portfolio Not Found</h2>
                <p>{error || 'The portfolio you are looking for does not exist.'}</p>
                <button onClick={() => navigate('/dashboard')} className="back-home-btn">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="portfolio-container">
            {/* Navigation */}
            <nav className="portfolio-nav">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>
            </nav>

            <div className="portfolio-content">
                {/* Hero Section */}
                <div className="portfolio-hero">
                    <div className="portfolio-hero-bg"></div>
                    <div className="portfolio-hero-content">
                        <div className="portfolio-avatar-container">
                            <div className="portfolio-avatar-large">
                                {user.image ? (
                                    <img src={user.image} alt={user.name} />
                                ) : (
                                    <div className="avatar-placeholder-large">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="portfolio-hero-info">
                            <h1 className="portfolio-name">{user.name}</h1>
                            <div className="portfolio-meta">
                                <span className="portfolio-email">
                                    <Mail size={16} />
                                    {user.email}
                                </span>
                                {user.role && (
                                    <span className="portfolio-role-badge">
                                        {user.role}
                                    </span>
                                )}
                            </div>
                            {user.branch && (
                                <div className="portfolio-quick-info">
                                    <span><Briefcase size={14} /> {user.branch}</span>
                                    {user.sem && <span>Semester {user.sem}</span>}
                                    {user.passing_year && (
                                        <span><Calendar size={14} /> {user.passing_year}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="portfolio-grid">
                    {/* Left Column */}
                    <div className="portfolio-left">
                        {/* About Section */}
                        {user.about && (
                            <div className="info-card">
                                <h3 className="card-title">
                                    <BookOpen size={20} />
                                    About
                                </h3>
                                <p className="about-text">{user.about}</p>
                            </div>
                        )}

                        {/* Skills */}
                        {user.skills && user.skills.length > 0 && (
                            <div className="info-card">
                                <h3 className="card-title">
                                    <Code size={20} />
                                    Skills
                                </h3>
                                <div className="skills-grid">
                                    {user.skills.map((skill, index) => (
                                        <span key={index} className="skill-badge">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Achievements */}
                        {user.achievements && user.achievements.length > 0 && (
                            <div className="info-card">
                                <h3 className="card-title">
                                    <Award size={20} />
                                    Achievements
                                </h3>
                                <ul className="achievement-list">
                                    {user.achievements.map((achievement, index) => (
                                        <li key={index} className="achievement-item">
                                            <Award size={16} />
                                            <span>{achievement}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Interests */}
                        {user.interests && user.interests.length > 0 && (
                            <div className="info-card">
                                <h3 className="card-title">
                                    <Heart size={20} />
                                    Interests
                                </h3>
                                <div className="interests-grid">
                                    {user.interests.map((interest, index) => (
                                        <span key={index} className="interest-tag">
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="portfolio-right">
                        {/* Social Links */}
                        <div className="info-card">
                            <h3 className="card-title">Connect</h3>
                            <div className="social-links">
                                {user.github && (
                                    <a href={user.github} target="_blank" rel="noopener noreferrer" className="social-link github-link">
                                        <Github size={20} />
                                        <span>GitHub</span>
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                                {user.linkedin && (
                                    <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin-link">
                                        <Linkedin size={20} />
                                        <span>LinkedIn</span>
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                                {user.leetcode && (
                                    <a href={user.leetcode} target="_blank" rel="noopener noreferrer" className="social-link leetcode-link">
                                        <Code size={20} />
                                        <span>LeetCode</span>
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Projects */}
                        {user.projects && user.projects.length > 0 && (
                            <div className="info-card">
                                <h3 className="card-title">
                                    <Briefcase size={20} />
                                    Projects
                                </h3>
                                <div className="projects-list">
                                    {user.projects.map((project, index) => (
                                        <div key={index} className="project-item">
                                            <div className="project-icon">💼</div>
                                            <span>{project}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* GitHub Repos */}
                        {user.githubId && (
                            <div className="info-card github-section">
                                <div className="github-header">
                                    <div className="github-header-left">
                                        <div className="github-title-row">
                                            <Github size={24} />
                                            <div>
                                                <h3 className="github-title">GitHub</h3>
                                                {user.githubUsername && (
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
                                </div>

                                {/* GitHub Stats */}
                                <div className="github-stats">
                                    <div className="stat-item">
                                        <div className="stat-value">{user.githubRepos?.length || githubRepos.length || 0}</div>
                                        <div className="stat-label">Repositories</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">
                                            {(githubRepos.length > 0 ? githubRepos : (user.githubRepos || [])).reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0)}
                                        </div>
                                        <div className="stat-label">Total Stars</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">
                                            {(githubRepos.length > 0 ? githubRepos : (user.githubRepos || [])).reduce((acc, repo) => acc + (repo.forks_count || 0), 0)}
                                        </div>
                                        <div className="stat-label">Total Forks</div>
                                    </div>
                                </div>

                                <div className="repos-section">
                                    <div className="repos-header">
                                        <h4 className="repos-subtitle">Top Repositories</h4>
                                        {user.githubUsername && (
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

                                    {githubRepos.length > 0 ? (
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
                                    ) : user.githubRepos && user.githubRepos.length > 0 ? (
                                        <div className="repos-grid">
                                            {user.githubRepos.slice(0, 6).map((repo, index) => (
                                                <a
                                                    key={index}
                                                    href={repo.html_url || `https://github.com/${user.githubUsername}/${repo.name}`}
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
                                                        {repo.stargazers_count !== undefined && (
                                                            <span className="repo-stat">
                                                                <span className="stat-icon">⭐</span>
                                                                {repo.stargazers_count}
                                                            </span>
                                                        )}
                                                        {repo.forks_count !== undefined && (
                                                            <span className="repo-stat">
                                                                <span className="stat-icon">🍴</span>
                                                                {repo.forks_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {repo.updated_at && (
                                                        <div className="repo-updated">
                                                            Updated {new Date(repo.updated_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </div>
                                                    )}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Portfolio;
