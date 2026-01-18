import React, { useState, useEffect } from 'react';
import './OnboardingAnimation.css';

const OnboardingAnimation = ({ onComplete }) => {
    const [lines, setLines] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [showCursor, setShowCursor] = useState(true);

    const installSteps = [
        { text: '$ npm install @interprep/core', delay: 100, type: 'command' },
        { text: 'Resolving dependencies...', delay: 300, type: 'info' },
        { text: '├── react@18.2.0', delay: 150, type: 'tree' },
        { text: '├── ai-engine@2.1.4', delay: 150, type: 'tree' },
        { text: '├── interview-simulator@1.8.3', delay: 150, type: 'tree' },
        { text: '├── code-analyzer@3.0.1', delay: 150, type: 'tree' },
        { text: '└── study-planner@2.5.0', delay: 150, type: 'tree' },
        { text: '', delay: 100, type: 'blank' },
        { text: 'Installing packages...', delay: 200, type: 'info' },
        { text: '[████████████████████] 100%', delay: 800, type: 'progress', showProgress: true },
        { text: '', delay: 100, type: 'blank' },
        { text: '✓ Successfully installed 127 packages', delay: 200, type: 'success' },
        { text: '✓ Initialized AI interview engine', delay: 200, type: 'success' },
        { text: '✓ Configured study planner', delay: 200, type: 'success' },
        { text: '✓ Set up code playground', delay: 200, type: 'success' },
        { text: '✓ Connected to knowledge base', delay: 200, type: 'success' },
        { text: '', delay: 100, type: 'blank' },
        { text: '🚀 InterPrep is ready!', delay: 300, type: 'ready' },
        { text: 'Welcome to your interview preparation journey...', delay: 500, type: 'welcome' }
    ];

    useEffect(() => {
        // Blinking cursor effect
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);

        return () => clearInterval(cursorInterval);
    }, []);

    useEffect(() => {
        if (currentStep < installSteps.length) {
            const step = installSteps[currentStep];
            const timer = setTimeout(() => {
                setLines(prev => [...prev, step]);
                setCurrentStep(prev => prev + 1);

                // Update progress
                const newProgress = ((currentStep + 1) / installSteps.length) * 100;
                setProgress(newProgress);
            }, step.delay);

            return () => clearTimeout(timer);
        } else {
            // Animation complete
            setTimeout(() => {
                onComplete();
            }, 1000);
        }
    }, [currentStep]);

    return (
        <div className="terminal-overlay">
            <div className="terminal-container">
                {/* Terminal Header */}
                <div className="terminal-header">
                    <div className="terminal-buttons">
                        <span className="terminal-button close"></span>
                        <span className="terminal-button minimize"></span>
                        <span className="terminal-button maximize"></span>
                    </div>
                    <div className="terminal-title">
                        InterPrep Installation — bash — 80×24
                    </div>
                    <div className="terminal-progress">
                        <div className="terminal-progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                {/* Terminal Body */}
                <div className="terminal-body">
                    <div className="terminal-content">
                        {/* Welcome message */}
                        <div className="terminal-line welcome-line">
                            <span className="terminal-prompt">user@interprep</span>
                            <span className="terminal-separator">:</span>
                            <span className="terminal-path">~</span>
                            <span className="terminal-dollar">$</span>
                        </div>

                        {/* Installation lines */}
                        {lines.map((line, index) => (
                            <div key={index} className={`terminal-line ${line.type}-line`}>
                                {line.type === 'command' && <span className="command-prefix">$ </span>}
                                {line.type === 'tree' && <span className="tree-prefix">  </span>}
                                {line.type === 'success' && <span className="success-icon">✓ </span>}
                                <span className="line-text">{line.text}</span>
                                {index === lines.length - 1 && showCursor && (
                                    <span className="terminal-cursor">█</span>
                                )}
                            </div>
                        ))}

                        {/* Loading spinner for current line */}
                        {currentStep < installSteps.length && currentStep > 0 && (
                            <div className="terminal-line loading-line">
                                <span className="spinner">⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Terminal Footer */}
                <div className="terminal-footer">
                    <div className="terminal-stats">
                        <span className="stat">
                            <span className="stat-label">Progress:</span>
                            <span className="stat-value">{Math.round(progress)}%</span>
                        </span>
                        <span className="stat">
                            <span className="stat-label">Packages:</span>
                            <span className="stat-value">{currentStep}/{installSteps.length}</span>
                        </span>
                        <span className="stat">
                            <span className="stat-label">Status:</span>
                            <span className="stat-value status-installing">
                                {progress < 100 ? 'Installing...' : 'Complete ✓'}
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Background matrix effect */}
            <div className="matrix-bg">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="matrix-column" style={{
                        left: `${i * 5}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${10 + Math.random() * 10}s`
                    }}>
                        {[...Array(20)].map((_, j) => (
                            <span key={j} className="matrix-char">
                                {String.fromCharCode(0x30A0 + Math.random() * 96)}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OnboardingAnimation;
