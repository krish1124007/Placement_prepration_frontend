import React, { useState } from 'react';
import LogoutAnimation from '../components/LogoutAnimation';

const LogoutTest = () => {
    const [showLogout, setShowLogout] = useState(false);

    const handleLogout = () => {
        setShowLogout(true);
    };

    const handleComplete = () => {
        setShowLogout(false);
        alert('Logout animation completed! 🎮');
    };

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontFamily: 'system-ui'
        }}>
            {showLogout ? (
                <LogoutAnimation onComplete={handleComplete} />
            ) : (
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ marginBottom: '20px', fontSize: '36px' }}>Logout Animation Test</h1>
                    <p style={{ marginBottom: '30px', fontSize: '18px', opacity: 0.9 }}>
                        Click the button to see the logout animation
                    </p>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '16px 32px',
                            fontSize: '18px',
                            background: '#000',
                            color: '#808080',
                            border: '2px solid #808080',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontFamily: 'Orbitron, monospace',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#808080';
                            e.target.style.color = '#000';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#000';
                            e.target.style.color = '#808080';
                        }}
                    >
                        Trigger Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default LogoutTest;
