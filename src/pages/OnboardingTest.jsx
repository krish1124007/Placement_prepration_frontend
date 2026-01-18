import React, { useState } from 'react';
import OnboardingAnimation from '../components/OnboardingAnimation';

const OnboardingTest = () => {
    const [showOnboarding, setShowOnboarding] = useState(true);

    const handleComplete = () => {
        setShowOnboarding(false);
        alert('Onboarding animation completed! 🎉');
    };

    const handleRestart = () => {
        setShowOnboarding(true);
    };

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a1a2e',
            color: 'white',
            fontFamily: 'system-ui'
        }}>
            {showOnboarding ? (
                <OnboardingAnimation onComplete={handleComplete} />
            ) : (
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ marginBottom: '20px' }}>✓ Onboarding Complete!</h1>
                    <button
                        onClick={handleRestart}
                        style={{
                            padding: '12px 24px',
                            fontSize: '16px',
                            background: '#64ffda',
                            color: '#0a0e27',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Replay Animation
                    </button>
                </div>
            )}
        </div>
    );
};

export default OnboardingTest;
