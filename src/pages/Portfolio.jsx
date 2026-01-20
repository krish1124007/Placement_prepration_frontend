import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import {
    Github, Linkedin, Code, ExternalLink, Loader, AlertCircle,
    ArrowLeft, Star, GitFork, Moon, Sun, Sparkles
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCards } from 'swiper/modules';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-cards';
import './Portfolio.css';

gsap.registerPlugin(ScrollTrigger);

const getLanguageColor = (language) => {
    const colors = {
        JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
        Java: '#b07219', 'C++': '#f34b7d', C: '#555555', 'C#': '#178600',
        Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95',
        Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB',
        HTML: '#e34c26', CSS: '#563d7c', Vue: '#41b883', React: '#61dafb',
    };
    return colors[language] || '#64748b';
};

const Portfolio = () => {
    const { username, userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [githubRepos, setGithubRepos] = useState([]);
    const [darkMode, setDarkMode] = useState(false);

    // Mouse tracking
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

    useEffect(() => {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('portfolioTheme');
        setDarkMode(savedTheme === 'dark');
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
        }
        localStorage.setItem('portfolioTheme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (!loading && user) {
            const ctx = gsap.context(() => {
                gsap.from('.hero-content-ultra', {
                    opacity: 0,
                    y: 80,
                    duration: 1.2,
                    ease: 'power4.out',
                });

                gsap.from('.portfolio-section-ultra', {
                    scrollTrigger: {
                        trigger: '.portfolio-section-ultra',
                        start: 'top 85%',
                    },
                    opacity: 0,
                    y: 100,
                    duration: 1,
                    stagger: 0.3,
                    ease: 'power3.out',
                });

                gsap.from('.skill-pill', {
                    scrollTrigger: {
                        trigger: '.skills-container-ultra',
                        start: 'top 75%',
                    },
                    opacity: 0,
                    scale: 0.5,
                    rotation: 180,
                    duration: 0.8,
                    stagger: 0.05,
                    ease: 'back.out(2)',
                });
            });
            return () => ctx.revert();
        }
    }, [loading, user]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError('');

            if (userId) {
                const response = await userAPI.getUserPublic(userId);
                if (response.data) {
                    setUser(response.data);
                    if (response.data.githubRepos?.length) {
                        setGithubRepos(response.data.githubRepos);
                    }
                }
            } else {
                const response = await userAPI.getProfile();
                if (response.data) {
                    setUser(response.data);
                    if (response.data.githubRepos?.length) {
                        setGithubRepos(response.data.githubRepos);
                    }
                }
            }
        } catch (err) {
            setError('Portfolio not found.');
        } finally {
            setLoading(false);
        }
    };

    const allProjects = [
        ...(user?.projects || []).map((project, idx) => ({
            id: `proj-${idx}`,
            name: typeof project === 'string' ? project : project.name,
            description: typeof project === 'object' ? project.description : '',
            type: 'project',
        })),
        ...(githubRepos || []).map((repo) => ({
            id: repo.id,
            name: repo.name,
            description: repo.description,
            type: 'repo',
            url: repo.html_url,
            language: repo.language,
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
        }))
    ];

    if (loading) {
        return (
            <div className="portfolio-loading-ultra">
                <Loader className="spinner-ultra" size={56} />
                <p>Loading amazing portfolio...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="portfolio-error-ultra">
                <AlertCircle size={64} />
                <h2>Portfolio Not Found</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/dashboard')} className="btn-ultra-primary">
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="portfolio-ultra">
            {/* Animated Background */}
            <div className="animated-bg">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            {/* Mouse Follower */}
            <motion.div
                className="mouse-follower"
                style={{
                    left: springX,
                    top: springY,
                }}
            />

            {/* Navigation */}
            <motion.nav
                className="nav-ultra"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <button onClick={() => navigate('/dashboard')} className="nav-btn-ultra">
                    <ArrowLeft size={20} />
                    <span>Dashboard</span>
                </button>
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="theme-toggle-ultra"
                    aria-label="Toggle theme"
                >
                    {darkMode ? <Sun size={22} /> : <Moon size={22} />}
                </button>
            </motion.nav>

            {/* Hero Section */}
            <section className="hero-ultra">
                <div className="hero-content-ultra">
                    <motion.div
                        className="avatar-ultra"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 1, type: 'spring', bounce: 0.5 }}
                    >
                        {user.image ? (
                            <img src={user.image} alt={user.name} />
                        ) : (
                            <div className="avatar-placeholder-ultra">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="avatar-glow"></div>
                    </motion.div>

                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        {user.name}
                    </motion.h1>

                    {user.role && (
                        <motion.p
                            className="hero-subtitle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {user.role}
                        </motion.p>
                    )}

                    <motion.div
                        className="hero-meta-ultra"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        {user.email && <span>✉️ {user.email}</span>}
                        {user.branch && <span>📚 {user.branch}</span>}
                        {user.passing_year && <span>🎓 Class of {user.passing_year}</span>}
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <div className="content-ultra">
                {/* About */}
                {user.about && (
                    <section className="portfolio-section-ultra about-ultra">
                        <motion.div
                            className="glass-card"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="section-title-ultra">
                                <Sparkles size={28} />
                                About Me
                            </h2>
                            <p className="about-text-ultra">{user.about}</p>
                        </motion.div>
                    </section>
                )}

                {/* Skills */}
                {user.skills?.length > 0 && (
                    <section className="portfolio-section-ultra skills-ultra">
                        <h2 className="section-title-ultra">
                            <Code size={28} />
                            Technical Arsenal
                        </h2>
                        <div className="skills-container-ultra">
                            {user.skills.map((skill, idx) => (
                                <motion.span
                                    key={idx}
                                    className="skill-pill"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {skill}
                                </motion.span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects Carousel */}
                {allProjects.length > 0 && (
                    <section className="portfolio-section-ultra projects-ultra">
                        <h2 className="section-title-ultra">
                            <Star size={28} />
                            Featured Projects
                        </h2>
                        <div className="projects-swiper-ultra">
                            <Swiper
                                modules={[Navigation, Pagination, Autoplay]}
                                spaceBetween={24}
                                slidesPerView={1}
                                breakpoints={{
                                    640: { slidesPerView: 2 },
                                    1024: { slidesPerView: 3 },
                                }}
                                pagination={{ clickable: true }}
                                navigation
                                autoplay={{ delay: 4000, pauseOnMouseEnter: true }}
                                loop={allProjects.length > 3}
                            >
                                {allProjects.map((project) => (
                                    <SwiperSlide key={project.id}>
                                        <motion.div
                                            className="project-card-ultra"
                                            whileHover={{ y: -10 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {project.type === 'repo' ? (
                                                <a href={project.url} target="_blank" rel="noopener noreferrer" className="project-link">
                                                    <div className="project-icon-ultra">
                                                        <Github size={32} />
                                                    </div>
                                                    <h3 className="project-name-ultra">{project.name}</h3>
                                                    {project.description && (
                                                        <p className="project-desc-ultra">{project.description}</p>
                                                    )}
                                                    <div className="project-meta-ultra">
                                                        {project.language && (
                                                            <span className="lang-badge">
                                                                <span
                                                                    className="lang-dot-ultra"
                                                                    style={{ background: getLanguageColor(project.language) }}
                                                                />
                                                                {project.language}
                                                            </span>
                                                        )}
                                                        <span className="stat-badge">
                                                            <Star size={14} /> {project.stars}
                                                        </span>
                                                        <span className="stat-badge">
                                                            <GitFork size={14} /> {project.forks}
                                                        </span>
                                                    </div>
                                                </a>
                                            ) : (
                                                <div className="project-link">
                                                    <div className="project-icon-ultra">💼</div>
                                                    <h3 className="project-name-ultra">{project.name}</h3>
                                                    {project.description && (
                                                        <p className="project-desc-ultra">{project.description}</p>
                                                    )}
                                                    <div className="personal-badge">Personal Project</div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </section>
                )}

                {/* Achievements */}
                {user.achievements?.length > 0 && (
                    <section className="portfolio-section-ultra achievements-ultra">
                        <h2 className="section-title-ultra">🏆 Achievements</h2>
                        <div className="achievements-grid-ultra">
                            {user.achievements.map((achievement, idx) => (
                                <motion.div
                                    key={idx}
                                    className="achievement-card-ultra"
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ scale: 1.03, x: 10 }}
                                >
                                    <span className="achievement-icon">🎖️</span>
                                    <p>{achievement}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Contact */}
                <section className="portfolio-section-ultra contact-ultra">
                    <motion.div
                        className="glass-card"
                        whileHover={{ scale: 1.02 }}
                    >
                        <h2 className="section-title-ultra">📫 Let's Connect</h2>
                        <div className="social-grid-ultra">
                            {user.github && (
                                <motion.a
                                    href={user.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-btn-ultra github-btn"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Github size={28} />
                                    <span>GitHub</span>
                                    <ExternalLink size={16} className="external-icon-ultra" />
                                </motion.a>
                            )}
                            {user.linkedin && (
                                <motion.a
                                    href={user.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-btn-ultra linkedin-btn"
                                    whileHover={{ scale: 1.1, rotate: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Linkedin size={28} />
                                    <span>LinkedIn</span>
                                    <ExternalLink size={16} className="external-icon-ultra" />
                                </motion.a>
                            )}
                            {user.leetcode && (
                                <motion.a
                                    href={user.leetcode}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-btn-ultra leetcode-btn"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Code size={28} />
                                    <span>LeetCode</span>
                                    <ExternalLink size={16} className="external-icon-ultra" />
                                </motion.a>
                            )}
                        </div>
                    </motion.div>
                </section>
            </div>

            {/* Footer */}
            <footer className="footer-ultra">
                <p>© {new Date().getFullYear()} {user.name}. Crafted with ❤️</p>
            </footer>
        </div>
    );
};

export default Portfolio;
