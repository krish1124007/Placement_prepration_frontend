import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ChevronDown, Briefcase, Send } from 'lucide-react';
import './Signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
    });
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const containerRef = useRef(null);

    // Mouse move effect for cursor
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return;

            const container = containerRef.current;
            const { left, top } = container.getBoundingClientRect();
            const x = e.clientX - left;
            const y = e.clientY - top;

            createCursorTrail(x, y);
        };

        const createCursorTrail = (x, y) => {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.left = `${x}px`;
            trail.style.top = `${y}px`;

            const colors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            trail.style.backgroundColor = color;

            containerRef.current.appendChild(trail);

            setTimeout(() => {
                if (trail.parentNode === containerRef.current) {
                    containerRef.current.removeChild(trail);
                }
            }, 800);
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
        setShowError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            setShowError(true);
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address');
            setShowError(true);
            return;
        }

        setLoading(true);
        setError('');
        setShowError(false);

        const startTime = Date.now();
        const minAnimationDuration = 1500;

        try {
            const response = await authAPI.signup(formData);

            if (response.status === 200 && response.data) {
                const { token, ...userData } = response.data;

                login(token, userData);

                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, minAnimationDuration - elapsedTime);

                setTimeout(() => {
                    navigate('/dashboard');
                }, remainingTime);
            }
        } catch (err) {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 1200 - elapsedTime);

            setTimeout(() => {
                setError(err.response?.data?.message || 'Signup failed. Please try again.');
                setShowError(true);
                setFormData(prev => ({ ...prev, password: '' }));
                setLoading(false);
            }, remainingTime);
        }
    };

    const handleGoogleSignup = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                // Send the access token to your backend for signup
                const response = await authAPI.googleSignup(tokenResponse.access_token);

                if (response.status === 200 && response.data) {
                    const { token, ...userData } = response.data;
                    login(token, userData);
                    navigate('/dashboard');
                }
            } catch (err) {
                setError('Google signup failed. Please try again.');
                setShowError(true);
                setLoading(false);
            }
        },
        onError: () => {
            setError('Google signup failed. Please try again.');
            setShowError(true);
        },
    });

    return (
        <div className={`signup-container ${loading ? 'loading-state' : ''} ${showError ? 'error-state' : ''}`} ref={containerRef}>
            {/* Paper plane animation */}
            <div className={`paper-plane ${loading ? 'flying' : ''} ${showError ? 'crashed' : ''}`}>
                <Send size={32} />
            </div>

            <div className={`signup-card ${loading ? 'slide-up' : ''}`}>
                {/* Logo and App Name */}
                <div className="logo-section">
                    <div className="logo-wrapper">
                        <Briefcase size={48} className="logo-icon" />
                    </div>
                    <h1 className="app-name">interPrep</h1>
                    <p className="app-subtitle">Create Your Account</p>
                </div>

                {/* Sign up with Google */}
                <button
                    className="google-button"
                    onClick={() => handleGoogleSignup()}
                    type="button"
                    disabled={loading}
                >
                    <div className="google-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    </div>
                    Sign up with Google
                </button>

                {/* OR Divider */}
                <div className="divider">
                    <span>OR</span>
                </div>

                {/* Error Message */}
                {error && showError && (
                    <div className="error-banner">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="signup-form">
                    {/* Name and Email */}
                    <div className="inputs-row">
                        <div className="input-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Full Name"
                                disabled={loading}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Email"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password and Role */}
                    <div className="inputs-row">
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="role">Role</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            >
                                <option value="student">Student</option>
                                <option value="alumni">Alumni</option>
                            </select>
                        </div>
                    </div>

                    {/* Down Arrow Submit Button */}
                    <button
                        type="submit"
                        className="arrow-button"
                        disabled={loading}
                        aria-label="Submit signup"
                    >
                        <ChevronDown size={32} />
                    </button>
                </form>

                {/* Bottom Options */}
                <div className="bottom-options">
                    <Link to="/login" className="link-text">
                        Already have an account?
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
