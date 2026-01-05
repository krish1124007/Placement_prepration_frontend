import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ChevronDown, Briefcase, Send } from 'lucide-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [characterColors, setCharacterColors] = useState({});
    const [showError, setShowError] = useState(false);
    const containerRef = useRef(null);
    const emailInputRef = useRef(null);
    const prevEmailLengthRef = useRef(0);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

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
        const { name, value } = e.target;

        if (name === 'email') {
            const newLength = value.length;
            const oldLength = prevEmailLengthRef.current;

            // If user is typing (adding characters)
            if (newLength > oldLength) {
                // Get the new character positions
                for (let i = oldLength; i < newLength; i++) {
                    const char = value[i];
                    // Set color for this character
                    const colors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335'];
                    const colorIndex = i % colors.length;

                    setCharacterColors(prev => ({
                        ...prev,
                        [i]: colors[colorIndex]
                    }));

                    // Reset color after 1 second
                    setTimeout(() => {
                        setCharacterColors(prev => ({
                            ...prev,
                            [i]: '#374151'
                        }));
                    }, 1000);
                }
            } else if (newLength < oldLength) {
                // If deleting characters, remove their color entries
                const updatedColors = { ...characterColors };
                for (let i = newLength; i < oldLength; i++) {
                    delete updatedColors[i];
                }
                setCharacterColors(updatedColors);
            }

            prevEmailLengthRef.current = newLength;
        }

        setFormData({
            ...formData,
            [name]: value,
        });
        setError('');
        setShowError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
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

        // Track start time to ensure minimum animation duration
        const startTime = Date.now();
        const minAnimationDuration = 1500; // 1.5 seconds

        try {
            const response = await authAPI.login(formData.email, formData.password);

            if (response.status === 200 && response.data) {
                const { token, ...userData } = response.data;

                login(token, userData);

                // Calculate remaining time to ensure animation plays for full duration
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, minAnimationDuration - elapsedTime);

                // Wait for animation to complete before navigation
                setTimeout(() => {
                    navigate('/dashboard');
                }, remainingTime);
            }
        } catch (err) {
            // Ensure error animation plays for minimum duration
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 1200 - elapsedTime); // 1.2s for crash animation

            setTimeout(() => {
                setError('Invalid email or password');
                setShowError(true);
                setFormData(prev => ({ ...prev, password: '' }));
                setLoading(false);
            }, remainingTime);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                // Send the access token to your backend
                const response = await authAPI.googleLogin(tokenResponse.access_token);

                if (response.status === 200 && response.data) {
                    const { token, ...userData } = response.data;
                    login(token, userData);
                    navigate('/dashboard');
                }
            } catch (err) {
                setError('Google login failed. Please try again.');
                setShowError(true);
                setLoading(false);
            }
        },
        onError: () => {
            setError('Google login failed. Please try again.');
            setShowError(true);
        },
    });

    // Render email with colored characters
    const renderEmailWithColors = () => {
        return formData.email.split('').map((char, index) => (
            <span
                key={index}
                className="email-character"
                style={{
                    color: characterColors[index] || '#374151',
                    transition: 'color 0.3s ease'
                }}
            >
                {char}
            </span>
        ));
    };

    return (
        <div className={`login-container ${loading ? 'loading-state' : ''} ${showError ? 'error-state' : ''}`} ref={containerRef}>
            {/* Paper plane animation */}
            <div className={`paper-plane ${loading ? 'flying' : ''} ${showError ? 'crashed' : ''}`}>
                <Send size={32} />
            </div>

            <div className={`login-card ${loading ? 'slide-up' : ''}`}>
                {/* Logo and App Name */}
                <div className="logo-section">
                    <div className="logo-wrapper">
                        <Briefcase size={48} className="logo-icon" />
                    </div>
                    <h1 className="app-name">interPrep</h1>
                </div>

                {/* Sign up with Google */}
                <button
                    className="google-button"
                    onClick={() => handleGoogleLogin()}
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
                <form onSubmit={handleSubmit} className="login-form">
                    {/* Side by Side Inputs */}
                    <div className="inputs-row">
                        {/* Email Input */}
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <div className="email-input-wrapper" onClick={() => emailInputRef.current?.focus()}>
                                <input
                                    ref={emailInputRef}
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    disabled={loading}
                                    className="email-input"
                                />
                                <div className="email-display">
                                    {renderEmailWithColors()}
                                    {formData.email.length === 0 && (
                                        <span className="email-placeholder">Email</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Password Input */}
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
                                    autoComplete="current-password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Down Arrow Submit Button */}
                    <button
                        type="submit"
                        className="arrow-button"
                        disabled={loading}
                        aria-label="Submit login"
                    >
                        <ChevronDown size={32} />
                    </button>
                </form>

                {/* Bottom Options */}
                <div className="bottom-options">
                    <Link to="/forgot-password" className="link-text">
                        Forgot Password?
                    </Link>
                    <span className="separator">•</span>
                    <Link to="/signup" className="link-text">
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;