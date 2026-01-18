import React, { useState, useEffect } from 'react';
import './LogoutAnimation.css';

const LogoutAnimation = ({ onComplete }) => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        // Animate dots
        const dotsInterval = setInterval(() => {
            setDots(prev => {
                if (prev.length >= 3) return '';
                return prev + '.';
            });
        }, 500);

        // Complete after 2 seconds
        const timer = setTimeout(() => {
            onComplete();
        }, 2000);

        return () => {
            clearInterval(dotsInterval);
            clearTimeout(timer);
        };
    }, [onComplete]);

    return (
        <div className="logout-overlay">
            <div className="logout-content">
                <h1 className="logout-text">
                    Logging out{dots}
                </h1>
            </div>
        </div>
    );
};

export default LogoutAnimation;
