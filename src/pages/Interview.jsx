import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewAPI } from '../services/api';
import { speechRecognition, speechSynthesis } from '../ai/config/speechService';
import { Mic, MicOff, X, Settings, MoreVertical } from 'lucide-react';
import './Interview.css';

const Interview = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('IDLE');
    const [transcriptions, setTranscriptions] = useState([]);
    const [error, setError] = useState(null);

    // Voice states
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    const transcriptTimeoutRef = useRef(null);
    const timerRef = useRef(null);
    const transcriptEndRef = useRef(null);

    useEffect(() => {
        fetchSession();

        return () => {
            speechRecognition.stop();
            speechSynthesis.cancel();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [sessionId]);

    useEffect(() => {
        // Auto-scroll to bottom of transcript
        if (transcriptEndRef.current) {
            transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [transcriptions]);

    const fetchSession = async () => {
        try {
            const response = await interviewAPI.getSession(sessionId);
            if (response.data) {
                setSession(response.data);
                setTranscriptions(response.data.transcriptions || []);
            }
        } catch (error) {
            console.error('Failed to fetch session:', error);
            setError('Failed to load interview session');
        } finally {
            setLoading(false);
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startInterview = async () => {
        setStatus('CONNECTING');
        try {
            const response = await interviewAPI.startInterview(sessionId);

            if (response.data) {
                setStatus('ACTIVE');
                startTimer();

                const initialMessage = response.data.initialMessage;
                if (initialMessage) {
                    const newTranscription = {
                        speaker: 'AI',
                        text: initialMessage,
                        timestamp: Date.now()
                    };
                    setTranscriptions([newTranscription]);
                    await speakText(initialMessage);
                }

                startListening();
            }
        } catch (error) {
            console.error('Failed to start interview:', error);
            setError('Failed to start interview');
            setStatus('IDLE');
        }
    };

    // Use ref to track accumulated transcript for the timeout handler
    const transcriptRef = useRef('');
    useEffect(() => {
        transcriptRef.current = currentTranscript;
    }, [currentTranscript]);

    const handleSendUserMessage = () => {
        const text = transcriptRef.current;
        if (text && text.trim().length > 0) {
            sendMessageToAI(text);
        }
    };

    const startListening = () => {
        if (!speechRecognition.isSupported()) {
            setError('Speech recognition not supported in this browser.');
            return;
        }

        // Don't start if already listening/thinking/speaking
        if (isListening || isThinking || isSpeaking) return;

        setCurrentTranscript('');
        setInterimTranscript('');

        const started = speechRecognition.start(
            (result) => {
                setInterimTranscript(result.interim);

                if (result.final && result.final.length > 0) {
                    const finalText = result.final;
                    setCurrentTranscript(prev => {
                        const newText = prev ? prev + ' ' + finalText : finalText;
                        return newText;
                    });

                    // Reset silence timer logic
                    if (transcriptTimeoutRef.current) {
                        clearTimeout(transcriptTimeoutRef.current);
                    }

                    // Smart delay: 1.5s silence before sending
                    transcriptTimeoutRef.current = setTimeout(() => {
                        // Use the latest value from state setter isn't reliable inside timeout closure
                        // so we pass the text directly or use a ref. 
                        // But here we can use the result.final if we accumulate it?
                        // Actually, we need the FULL transcript accumulated so far.
                        // Let's use a ref for current transcript to be safe.
                        handleSendUserMessage();
                    }, 1500);
                }
            },
            () => {
                // On End: Restart if we are supposed to be active and not processing
                // But only if we are in ACTIVE state and NOT speaking/thinking
                if (status === 'ACTIVE' && !isSpeaking && !isThinking) {
                    // Small delay to prevent CPU thrashing
                    setTimeout(() => {
                        if (status === 'ACTIVE' && !isSpeaking && !isThinking) {
                            startListening();
                        }
                    }, 300);
                } else {
                    setIsListening(false);
                }
            }
        );

        if (started) {
            setIsListening(true);
        }
    };

    const stopListening = () => {
        speechRecognition.stop();
        setIsListening(false);
        setInterimTranscript('');
        if (transcriptTimeoutRef.current) {
            clearTimeout(transcriptTimeoutRef.current);
        }
    };

    // Auto-restart listening when AI finishes speaking/thinking
    useEffect(() => {
        if (status === 'ACTIVE' && !isSpeaking && !isThinking && !isListening) {
            // Small delay to ensure clean state transition
            const timer = setTimeout(() => {
                if (status === 'ACTIVE' && !isSpeaking && !isThinking && !isListening) {
                    startListening();
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isSpeaking, isThinking, status, isListening]);

    const sendMessageToAI = async (message) => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) return;

        stopListening();
        setIsThinking(true);
        setCurrentTranscript('');

        try {
            const userTranscription = {
                speaker: 'User',
                text: trimmedMessage,
                timestamp: Date.now()
            };
            setTranscriptions(prev => [...prev, userTranscription]);

            const response = await interviewAPI.chatWithAI(sessionId, trimmedMessage);

            if (response.data && response.data.aiResponse) {
                const aiResponse = response.data.aiResponse;

                const aiTranscription = {
                    speaker: 'AI',
                    text: aiResponse,
                    timestamp: Date.now()
                };
                setTranscriptions(prev => [...prev, aiTranscription]);

                await speakText(aiResponse);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsThinking(false);
            // Effect will handle restart
        }
    };

    const speakText = async (text) => {
        setIsSpeaking(true);

        try {
            await speechSynthesis.speak(text, {
                rate: 0.95,
                pitch: 1.05,
                volume: 1.0,
                onStart: () => stopListening(),
                onEnd: () => setIsSpeaking(false)
            });
        } catch (error) {
            console.error('Speech error:', error);
            setIsSpeaking(false);
        }
    };

    const endInterview = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        stopListening();
        speechSynthesis.cancel();

        try {
            await interviewAPI.endInterview(sessionId, '');
            setStatus('ENDED');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error) {
            console.error('Failed to end interview:', error);
        }
    };

    if (loading) {
        return (
            <div className="interview-fullscreen">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading interview...</p>
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="interview-fullscreen">
                <div className="error-container">
                    <h2>Unable to load interview</h2>
                    <p>{error || 'Session not found'}</p>
                    <button onClick={() => navigate('/dashboard')} className="btn-primary">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'IDLE') {
        return (
            <div className="interview-fullscreen">
                <div className="pre-interview">
                    <div className="pre-interview-content">
                        <h1>Ready to begin?</h1>
                        <div className="session-details">
                            <h2>{session.topic}</h2>
                            <p>{session.level} Level • {session.tone || 'Professional'}</p>
                            {session.description && <p className="description">{session.description}</p>}
                        </div>
                        <button onClick={startInterview} className="btn-join">
                            <Mic size={20} />
                            Join Interview
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="btn-cancel">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'CONNECTING') {
        return (
            <div className="interview-fullscreen">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Connecting to AI interviewer...</p>
                </div>
            </div>
        );
    }

    if (status === 'ENDED') {
        return (
            <div className="interview-fullscreen">
                <div className="ended-container">
                    <div className="success-check">✓</div>
                    <h2>Interview Complete</h2>
                    <p>Your responses have been saved</p>
                </div>
            </div>
        );
    }

    return (
        <div className="interview-fullscreen">
            {/* Top Bar */}
            <div className="interview-topbar">
                <div className="topbar-left">
                    <div className="session-info">
                        <h3>{session.topic}</h3>
                        <span className="session-subtitle">{session.level} Level</span>
                    </div>
                </div>
                <div className="topbar-center">
                    <div className="timer">{formatTime(elapsedTime)}</div>
                </div>
                <div className="topbar-right">
                    <button className="icon-btn" title="Settings">
                        <Settings size={20} />
                    </button>
                    <button className="icon-btn" title="More">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="interview-main">
                {/* Video/Avatar Section */}
                <div className="video-section">
                    <div className="video-container">
                        <div className="ai-avatar">
                            <div className="avatar-circle">
                                <span>AI</span>
                            </div>
                            <div className="avatar-name">AI Interviewer</div>
                            {isSpeaking && (
                                <div className="speaking-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Your Video Preview */}
                    <div className="self-video">
                        <div className="self-avatar">
                            <span>{user?.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="self-name">{user?.name}</div>
                        {isListening && (
                            <div className="listening-indicator">
                                <div className="pulse-ring"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transcript Panel */}
                <div className="transcript-panel">
                    <div className="transcript-header">
                        <h4>Live Transcript</h4>
                        {isThinking && <span className="thinking-badge">AI is thinking...</span>}
                    </div>

                    <div className="transcript-content">
                        {transcriptions.map((t, idx) => (
                            <div key={idx} className={`transcript-message ${t.speaker.toLowerCase()}`}>
                                <div className="message-avatar">
                                    {t.speaker === 'AI' ? 'AI' : user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="message-content">
                                    <div className="message-sender">
                                        {t.speaker === 'AI' ? 'AI Interviewer' : user?.name}
                                    </div>
                                    <div className="message-text">{t.text}</div>
                                </div>
                            </div>
                        ))}

                        {(currentTranscript || interimTranscript) && (
                            <div className="transcript-message user active">
                                <div className="message-avatar">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="message-content">
                                    <div className="message-sender">{user?.name} (speaking...)</div>
                                    <div className="message-text">
                                        {currentTranscript} <span className="interim">{interimTranscript}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={transcriptEndRef}></div>
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="interview-controls">
                <div className="controls-container">
                    <button
                        className={`control-btn mic ${isListening ? 'active' : ''}`}
                        title={isListening ? 'Mute' : 'Unmute'}
                    >
                        {isListening ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>

                    <button
                        className="control-btn end"
                        onClick={endInterview}
                        title="Leave Interview"
                    >
                        <X size={24} />
                        <span>End</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Interview;
