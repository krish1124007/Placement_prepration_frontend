import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewAPI } from '../services/api';
import { speechRecognition, speechSynthesis } from '../ai/config/speechService';
import { Mic, MicOff, X, Settings, MoreVertical, Code, PenTool, Play } from 'lucide-react';
import './AIPanelInterview.css';

const AIPanelInterview = () => {
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

    // Panel states - AI can activate these
    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
    const [codeContent, setCodeContent] = useState('');
    const [activePanel, setActivePanel] = useState(null); // 'code', 'draw', or null

    // Drawing canvas states
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawColor, setDrawColor] = useState('#ffffff');
    const [drawSize, setDrawSize] = useState(3);

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
        if (transcriptEndRef.current) {
            transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [transcriptions]);

    // Initialize canvas
    useEffect(() => {
        if (showDrawingCanvas && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [showDrawingCanvas]);

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

    // AI can activate code editor or drawing canvas
    const activateCodeEditor = () => {
        setShowCodeEditor(true);
        setShowDrawingCanvas(false);
        setActivePanel('code');
    };

    const activateDrawingCanvas = () => {
        setShowDrawingCanvas(true);
        setShowCodeEditor(false);
        setActivePanel('draw');
    };

    const closeActivePanel = () => {
        setShowCodeEditor(false);
        setShowDrawingCanvas(false);
        setActivePanel(null);
    };

    const startListening = () => {
        if (!speechRecognition.isSupported()) {
            setError('Speech recognition not supported in this browser.');
            return;
        }

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

                    if (transcriptTimeoutRef.current) {
                        clearTimeout(transcriptTimeoutRef.current);
                    }

                    transcriptTimeoutRef.current = setTimeout(() => {
                        handleSendUserMessage();
                    }, 1500);
                }
            },
            () => {
                if (status === 'ACTIVE' && !isSpeaking && !isThinking) {
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

    useEffect(() => {
        if (status === 'ACTIVE' && !isSpeaking && !isThinking && !isListening) {
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

                // Check if AI wants to activate code editor or drawing canvas
                const lowerResponse = aiResponse.toLowerCase();
                if (lowerResponse.includes('write code') || lowerResponse.includes('code editor') || lowerResponse.includes('dsa code')) {
                    activateCodeEditor();
                } else if (lowerResponse.includes('draw') || lowerResponse.includes('sketch') || lowerResponse.includes('diagram')) {
                    activateDrawingCanvas();
                }

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

    // Drawing functions
    const startDrawing = (e) => {
        if (!showDrawingCanvas) return;
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e) => {
        if (!isDrawing || !showDrawingCanvas) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = drawSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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

    const handleTestScreen = () => {
        console.log('Test Screen Button Clicked');
        // This will be implemented later
        alert('Test functionality will be implemented soon!');
    };

    if (loading) {
        return (
            <div className="ai-interview-fullscreen">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading interview...</p>
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="ai-interview-fullscreen">
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
            <div className="ai-interview-fullscreen">
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
            <div className="ai-interview-fullscreen">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Connecting to AI interviewer...</p>
                </div>
            </div>
        );
    }

    if (status === 'ENDED') {
        return (
            <div className="ai-interview-fullscreen">
                <div className="ended-container">
                    <div className="success-check">✓</div>
                    <h2>Interview Complete</h2>
                    <p>Your responses have been saved</p>
                </div>
            </div>
        );
    }

    return (
        <div className="ai-interview-fullscreen">
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

                {/* Code Editor Panel - Activated by AI */}
                {showCodeEditor && (
                    <div className="code-editor-panel">
                        <div className="panel-header">
                            <div className="panel-title">
                                <Code size={18} />
                                <span>Code Editor</span>
                            </div>
                            <button className="panel-close" onClick={closeActivePanel}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="code-editor-container">
                            <textarea
                                className="code-editor"
                                value={codeContent}
                                onChange={(e) => setCodeContent(e.target.value)}
                                placeholder="Write your DSA code here..."
                                spellCheck={false}
                            />
                        </div>
                        <div className="code-editor-footer">
                            <select 
                                className="language-select"
                                defaultValue="javascript"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                            </select>
                            <button className="run-code-btn">
                                <Play size={16} />
                                Run Code
                            </button>
                        </div>
                    </div>
                )}

                {/* Drawing Canvas Panel - Activated by AI */}
                {showDrawingCanvas && (
                    <div className="drawing-panel">
                        <div className="panel-header">
                            <div className="panel-title">
                                <PenTool size={18} />
                                <span>Drawing Canvas</span>
                            </div>
                            <button className="panel-close" onClick={closeActivePanel}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="drawing-toolbar">
                            <input
                                type="color"
                                value={drawColor}
                                onChange={(e) => setDrawColor(e.target.value)}
                                className="color-picker"
                            />
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={drawSize}
                                onChange={(e) => setDrawSize(parseInt(e.target.value))}
                                className="brush-size"
                            />
                            <span className="brush-size-label">{drawSize}px</span>
                            <button className="clear-btn" onClick={clearCanvas}>
                                Clear
                            </button>
                        </div>
                        <div className="canvas-container">
                            <canvas
                                ref={canvasRef}
                                className="drawing-canvas"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                            />
                        </div>
                    </div>
                )}

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

                    {/* Test Button */}
                    <button
                        className="control-btn test"
                        onClick={handleTestScreen}
                        title="Test Screen"
                    >
                        <Play size={24} />
                        <span>Test</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIPanelInterview;
