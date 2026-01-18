import React, { useState, useEffect } from 'react';
import '../pages/Login.css'; // Reuse the same CSS

const SystemLoadingAnimation = ({ onComplete }) => {
    const [loadingStep, setLoadingStep] = useState(0);

    const loadingSteps = [
        'Awake up All System:',
        'Loading Your Data...',
        'Loading Your UI...',
        'Loading AI...'
    ];

    useEffect(() => {
        if (loadingStep < loadingSteps.length) {
            const timer = setTimeout(() => {
                setLoadingStep(prev => prev + 1);
            }, 1000); // Each step takes 1 second

            return () => clearTimeout(timer);
        } else if (loadingStep === loadingSteps.length) {
            // All steps complete
            const timer = setTimeout(() => {
                onComplete();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [loadingStep, onComplete]);

    return (
        <div className="system-loading-overlay">
            <div className="system-loading-content">
                <div className="system-terminal">
                    {loadingSteps.slice(0, loadingStep).map((step, index) => (
                        <div
                            key={index}
                            className={`system-loading-line ${index === 0 ? 'system-header' : ''}`}
                        >
                            <span className="system-prompt">{'>'}</span>
                            <span className="system-text">{step}</span>
                            {index === loadingStep - 1 && (
                                <span className="system-cursor">_</span>
                            )}
                        </div>
                    ))}
                </div>
                <div className="system-progress-bar">
                    <div
                        className="system-progress-fill"
                        style={{ width: `${(loadingStep / loadingSteps.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default SystemLoadingAnimation;
