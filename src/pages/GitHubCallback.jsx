import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import './GitHubCallback.css';

const GitHubCallback = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Connecting to GitHub...');

    useEffect(() => {
        const handleGitHubCallback = async () => {
            try {
                // Get the authorization code from URL
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');

                if (!code) {
                    throw new Error('No authorization code received');
                }

                if (!user?._id) {
                    throw new Error('User not authenticated');
                }

                // Send the code to backend
                const response = await userAPI.connectGithub(code, user._id);

                if (response.status === 200 && response.data) {
                    // Update user context with new data
                    updateUser(response.data);
                    setStatus('success');
                    setMessage('GitHub connected successfully!');

                    // Redirect to profile after 2 seconds
                    setTimeout(() => {
                        navigate('/profile');
                    }, 2000);
                } else {
                    throw new Error('Failed to connect GitHub account');
                }
            } catch (error) {
                console.error('GitHub connection error:', error);
                setStatus('error');
                setMessage(error.message || 'Failed to connect GitHub. Please try again.');

                // Redirect to profile after 3 seconds
                setTimeout(() => {
                    navigate('/profile');
                }, 3000);
            }
        };

        handleGitHubCallback();
    }, [user, navigate, updateUser]);

    return (
        <div className="github-callback-container">
            <div className="github-callback-card">
                {status === 'loading' && (
                    <>
                        <Loader className="callback-icon loading" size={64} />
                        <h2>{message}</h2>
                        <p>Please wait while we connect your GitHub account...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle className="callback-icon success" size={64} />
                        <h2>{message}</h2>
                        <p>Redirecting you back to your profile...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <XCircle className="callback-icon error" size={64} />
                        <h2>Connection Failed</h2>
                        <p>{message}</p>
                        <button onClick={() => navigate('/profile')} className="back-to-profile-btn">
                            Back to Profile
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default GitHubCallback;
