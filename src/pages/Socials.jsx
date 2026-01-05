import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import {
    Github,
    CheckCircle2,
    Link2,
    Zap,
    Shield,
    TrendingUp
} from 'lucide-react';
import './Socials.css';

const Socials = () => {
    const { user, updateUser } = useAuth();
    const [connectingGithub, setConnectingGithub] = useState(false);
    const [githubRepos, setGithubRepos] = useState([]);
    const [callbackProcessed, setCallbackProcessed] = useState(false);

    const handleConnectGithub = () => {
        setConnectingGithub(true);
        // GitHub OAuth - redirect to backend endpoint
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        const redirectUri = `${window.location.origin}/socials`;
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user,repo`;
    };

    // Handle GitHub OAuth callback
    useEffect(() => {
        const handleGithubCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');

            if (code && !callbackProcessed && user?._id) {
                setCallbackProcessed(true); // Mark as processing
                setConnectingGithub(true);
                try {
                    console.log('Connecting GitHub with code:', code);
                    console.log('User ID:', user._id);

                    // Send code to backend to exchange for token
                    const response = await userAPI.connectGithub(code, user._id);
                    console.log('GitHub connect response:', response);

                    // The response structure is { status, message, data }
                    if (response.data) {
                        updateUser(response.data);
                        console.log('User updated with GitHub data');
                    }

                    // Clean up URL
                    window.history.replaceState({}, document.title, '/socials');
                } catch (error) {
                    console.error('GitHub connection failed:', error);
                    console.error('Error details:', error.response?.data);
                    alert('Failed to connect GitHub: ' + (error.response?.data?.message || error.message));
                    setCallbackProcessed(false); // Allow retry on error
                } finally {
                    setConnectingGithub(false);
                }
            }
        };

        if (user) {
            handleGithubCallback();
        }
    }, [user?._id, callbackProcessed]); // Add callbackProcessed as dependency

    const fetchGithubRepos = async () => {
        if (user?.githubId && user?._id) {
            try {
                console.log('Fetching GitHub repos for user:', user._id);
                const response = await userAPI.getGithubRepos(user._id);
                console.log('GitHub repos response:', response);

                if (response.data && response.data.repos) {
                    setGithubRepos(response.data.repos);
                    console.log('Repos set:', response.data.repos.length);
                }
            } catch (error) {
                console.error('Failed to fetch repos:', error);
                console.error('Error details:', error.response?.data);
            }
        }
    };

    useEffect(() => {
        fetchGithubRepos();
    }, [user?.githubId]);

    const handleDisconnect = async (platform) => {
        if (platform === 'github') {
            try {
                await userAPI.disconnectGithub(user._id);
                updateUser({ githubId: null, githubUsername: null, githubRepos: null });
                setGithubRepos([]);
            } catch (error) {
                console.error('Disconnect failed:', error);
            }
        }
    };

    const isGoogleConnected = user?.googleId || false;
    const isGithubConnected = user?.githubId || false;


    return (
        <DashboardLayout>
            {/* Hero Section */}
            <div className="socials-hero">
                <div className="hero-content">
                    <h1>Connect & Amplify</h1>
                    <p>Link your professional accounts to unlock powerful integrations and showcase your achievements</p>
                </div>
                <div className="connection-stats">
                    <div className="stat-badge">
                        <span className="stat-number">{(isGoogleConnected ? 1 : 0) + (isGithubConnected ? 1 : 0)}/2</span>
                        <span className="stat-label">Connected</span>
                    </div>
                </div>
            </div>

            {/* Connection Cards - Horizontal */}
            <div className="connections-section">
                {/* Google Connection */}
                <div className={`connection-card ${isGoogleConnected ? 'connected' : ''}`}>
                    <div className="card-left">
                        <div className="provider-info">
                            <div className="provider-icon google-gradient">
                                <svg viewBox="0 0 24 24" width="28" height="28">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                            <div className="provider-details">
                                <h3>Google Account</h3>
                                <p>Sign in seamlessly and sync your workspace</p>
                            </div>
                        </div>

                        {isGoogleConnected && (
                            <div className="connected-status">
                                <CheckCircle2 size={20} />
                                <span>{user?.email}</span>
                            </div>
                        )}
                    </div>

                    <div className="card-right">
                        {isGoogleConnected ? (
                            <div className="status-badge connected-badge">
                                <CheckCircle2 size={16} />
                                <span>Connected</span>
                            </div>
                        ) : (
                            <div className="status-badge disconnected-badge">
                                <span>Connect via Login</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* GitHub Connection */}
                <div className={`connection-card ${isGithubConnected ? 'connected' : ''}`}>
                    <div className="card-left">
                        <div className="provider-info">
                            <div className="provider-icon github-gradient">
                                <Github size={28} />
                            </div>
                            <div className="provider-details">
                                <h3>GitHub Account</h3>
                                <p>Showcase your repositories and contributions</p>
                            </div>
                        </div>

                        {isGithubConnected && (
                            <div className="connected-status">
                                <CheckCircle2 size={20} />
                                <span>@{user?.githubUsername || 'Connected'}</span>
                            </div>
                        )}
                    </div>

                    <div className="card-right">
                        {isGithubConnected ? (
                            <button
                                className="disconnect-btn"
                                onClick={() => handleDisconnect('github')}
                            >
                                Disconnect
                            </button>
                        ) : (
                            <button
                                className="connect-btn github-btn"
                                onClick={handleConnectGithub}
                                disabled={connectingGithub}
                            >
                                {connectingGithub ? 'Connecting...' : 'Connect GitHub'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Benefits Section - Modern Grid */}
            <div className="benefits-section">
                <h2>Unlock Powerful Features</h2>
                <div className="benefits-grid">
                    <div className="benefit-card">
                        <div className="benefit-icon">
                            <Zap size={24} />
                        </div>
                        <h3>Instant Authentication</h3>
                        <p>One-click sign-in without remembering passwords</p>
                    </div>

                    <div className="benefit-card">
                        <div className="benefit-icon">
                            <Link2 size={24} />
                        </div>
                        <h3>Seamless Integration</h3>
                        <p>Auto-sync your profile data and achievements</p>
                    </div>

                    <div className="benefit-card">
                        <div className="benefit-icon">
                            <TrendingUp size={24} />
                        </div>
                        <h3>Enhanced Visibility</h3>
                        <p>Display your work and stand out to recruiters</p>
                    </div>

                    <div className="benefit-card">
                        <div className="benefit-icon">
                            <Shield size={24} />
                        </div>
                        <h3>Secure & Private</h3>
                        <p>Your data is encrypted and never shared</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Socials;
