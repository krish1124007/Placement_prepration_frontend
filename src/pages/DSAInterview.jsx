import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { planAPI } from '../services/api';
import { speechRecognition, speechSynthesis } from '../ai/config/speechService';
import { Clock, Code, CheckCircle, XCircle, Send, ArrowRight, Award, Mic, MicOff, Volume2 } from 'lucide-react';
import './DSAInterview.css';

const DSAInterview = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [phase, setPhase] = useState('idle'); // idle, preliminary, coding, completed

    // Preliminary phase
    const [prelimQuestions, setPrelimQuestions] = useState([]);
    const [prelimAnswers, setPrelimAnswers] = useState([]);
    const [currentPrelimIndex, setCurrentPrelimIndex] = useState(0);
    const [prelimAnswer, setPrelimAnswer] = useState('');

    // Voice State
    const [isListening, setIsListening] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');

    // Coding phase
    const [codingQuestions, setCodingQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour
    const [submissions, setSubmissions] = useState({});

    // Results
    const [scorecard, setScorecard] = useState(null);

    const timerRef = useRef(null);

    // Initialize Speech Recognition callbacks
    const handleSpeechResult = ({ final, interim }) => {
        if (final) {
            setPrelimAnswer(prev => {
                const newText = prev ? `${prev} ${final}` : final;
                return newText;
            });
        }
    };

    // Speak question when index changes in preliminary phase
    useEffect(() => {
        if (phase === 'preliminary' && prelimQuestions.length > 0) {
            const questionToSpeak = prelimQuestions[currentPrelimIndex];
            if (questionToSpeak) {
                // Slight delay to ensure UI is ready
                setTimeout(() => speakQuestion(questionToSpeak), 1000);
            }
        }
    }, [phase, currentPrelimIndex, prelimQuestions]);

    const speakQuestion = (text) => {
        // Stop listening while AI speaks
        stopListening();
        setIsAiSpeaking(true);

        speechSynthesis.speak(text, {
            onEnd: () => {
                setIsAiSpeaking(false);
                // Auto start mic after AI finishes
                startListening();
            },
            onError: () => {
                setIsAiSpeaking(false);
                startListening(); // Fallback
            }
        });
    };

    const startListening = () => {
        try {
            speechRecognition.start(handleSpeechResult, () => setIsListening(false));
            setIsListening(true);
        } catch (error) {
            console.error('Failed to start listening:', error);
            setIsListening(false);
        }
    };

    const stopListening = () => {
        try {
            speechRecognition.stop();
            setIsListening(false);
        } catch (error) {
            console.error('Failed to stop listening:', error);
        }
    };

    const toggleMic = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    useEffect(() => {
        fetchSession();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [sessionId]);

    const fetchSession = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/dsa-interviews/session/${sessionId}`);
            const data = await response.json();

            if (data.success || data.status === 200) {
                setSession(data.data);

                // Determine current phase based on session status
                if (data.data.status === 'preliminary') {
                    setPhase('preliminary');
                    setPrelimQuestions(data.data.preliminaryQuestions.map(q => q.question));
                } else if (data.data.status === 'coding') {
                    setPhase('coding');
                    setCodingQuestions(data.data.codingQuestions);
                    startTimer();
                } else if (data.data.status === 'completed') {
                    setPhase('completed');
                    fetchScorecard();
                }
            }
        } catch (error) {
            console.error('Failed to fetch session:', error);
        } finally {
            setLoading(false);
        }
    };

    const startPreliminary = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/dsa-interviews/preliminary/start/${sessionId}`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.success || data.status === 200) {
                setPrelimQuestions(data.data.questions);
                setPhase('preliminary');
            }
        } catch (error) {
            console.error('Failed to start preliminary:', error);
        }
    };

    const submitPrelimAnswer = () => {
        if (!prelimAnswer.trim()) return;

        stopListening(); // Stop mic when submitting
        speechSynthesis.cancel(); // Stop AI if speaking

        const newAnswers = [...prelimAnswers, {
            question: prelimQuestions[currentPrelimIndex],
            answer: prelimAnswer,
            timestamp: Date.now()
        }];

        setPrelimAnswers(newAnswers);
        setPrelimAnswer('');

        if (currentPrelimIndex < prelimQuestions.length - 1) {
            setCurrentPrelimIndex(currentPrelimIndex + 1);
        } else {
            completePreliminary(newAnswers);
        }
    };

    const completePreliminary = async (answers) => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/dsa-interviews/preliminary/submit/${sessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers })
            });
            const data = await response.json();

            if (data.success || data.status === 200) {
                alert(`Preliminary Score: ${data.data.score}/100\n${data.data.feedback}`);
                startCoding();
            }
        } catch (error) {
            console.error('Failed to submit preliminary answers:', error);
        }
    };

    const startCoding = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/dsa-interviews/coding/start/${sessionId}`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.success || data.status === 200) {
                setCodingQuestions(data.data.questions);
                setTimeRemaining(data.data.timeLimit);
                setPhase('coding');
                startTimer();
            }
        } catch (error) {
            console.error('Failed to start coding:', error);
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    completeInterview();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const submitCode = async () => {
        if (!code.trim()) {
            alert('Please write some code before submitting');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/v1/dsa-interviews/coding/submit/${sessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionNumber: codingQuestions[currentQuestionIndex].questionNumber,
                    code,
                    language
                })
            });
            const data = await response.json();

            if (data.success || data.status === 200) {
                setSubmissions({
                    ...submissions,
                    [currentQuestionIndex]: {
                        score: data.data.score,
                        analysis: data.data.analysis
                    }
                });

                alert(`Score: ${data.data.score}/100\nCode Quality: ${data.data.analysis.codeQuality}/10`);
            }
        } catch (error) {
            console.error('Failed to submit code:', error);
        }
    };

    const completeInterview = async () => {
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            const response = await fetch(`http://localhost:8000/api/v1/dsa-interviews/complete/${sessionId}`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.success || data.status === 200) {
                setPhase('completed');
                setScorecard(data.data);

                // Check for pending task completion
                const taskInfoStr = localStorage.getItem('pendingTaskCompletion');
                if (taskInfoStr) {
                    try {
                        const taskInfo = JSON.parse(taskInfoStr);
                        await planAPI.markTaskComplete(taskInfo);
                        localStorage.removeItem('pendingTaskCompletion');
                        console.log('Plan task marked as complete');
                    } catch (taskError) {
                        console.error('Failed to mark task complete:', taskError);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to complete interview:', error);
        }
    };

    const fetchScorecard = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/dsa-interviews/scorecard/${sessionId}`);
            const data = await response.json();

            if (data.success || data.status === 200) {
                setScorecard(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch scorecard:', error);
        }
    };

    if (loading) {
        return (
            <div className="dsa-interview-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading interview...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="dsa-interview-container">
                <div className="error-state">
                    <XCircle size={48} />
                    <h2>Interview Not Found</h2>
                    <button onClick={() => navigate('/dashboard')} className="btn-primary">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Idle State - Start Interview
    if (phase === 'idle') {
        return (
            <div className="dsa-interview-container">
                <div className="start-screen">
                    <div className="start-content">
                        <Code size={64} className="start-icon" />
                        <h1>DSA Interview</h1>
                        <div className="interview-details">
                            <h2>{session.topic}</h2>
                            <p className="level-badge">{session.level} Level</p>
                            <div className="interview-info">
                                <div className="info-item">
                                    <strong>Phase 1:</strong> 5 Theoretical Questions
                                </div>
                                <div className="info-item">
                                    <strong>Phase 2:</strong> 4 Coding Challenges
                                </div>
                                <div className="info-item">
                                    <strong>Time Limit:</strong> 1 Hour for Coding
                                </div>
                            </div>
                        </div>
                        <button onClick={startPreliminary} className="btn-start">
                            <ArrowRight size={20} />
                            Start Interview
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="btn-cancel">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Preliminary Phase
    if (phase === 'preliminary') {
        return (
            <div className="dsa-interview-container">
                <div className="interview-header">
                    <h2>Preliminary Questions</h2>
                    <div className="progress-indicator">
                        Question {currentPrelimIndex + 1} of {prelimQuestions.length}
                    </div>
                </div>

                <div className="preliminary-content">
                    <div className={`question-card ${isAiSpeaking ? 'speaking' : ''}`}>
                        <div className="question-header-row">
                            <h3>Question {currentPrelimIndex + 1}</h3>
                            <button
                                className="icon-btn-small"
                                onClick={() => speakQuestion(prelimQuestions[currentPrelimIndex])}
                                title="Replay Question"
                                disabled={isAiSpeaking}
                            >
                                <Volume2 size={20} />
                            </button>
                        </div>
                        <p className="question-text">{prelimQuestions[currentPrelimIndex]}</p>
                        {isAiSpeaking && <div className="speaking-indicator">AI is speaking...</div>}
                    </div>

                    <div className="answer-section">
                        <div className="answer-controls">
                            <label>Your Answer:</label>
                            <button
                                className={`mic-toggle-btn ${isListening ? 'listening' : ''}`}
                                onClick={toggleMic}
                            >
                                {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                                {isListening ? 'Listening...' : 'Click to Speak'}
                            </button>
                        </div>

                        <textarea
                            value={prelimAnswer}
                            onChange={(e) => setPrelimAnswer(e.target.value)}
                            placeholder="AI will listen to your answer automatically. You can also type here."
                            rows={8}
                            className={isListening ? 'active-listening' : ''}
                        />
                        <button onClick={submitPrelimAnswer} className="btn-submit">
                            <Send size={18} />
                            {currentPrelimIndex < prelimQuestions.length - 1 ? 'Next Question' : 'Submit All Answers'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Coding Phase
    if (phase === 'coding') {
        const currentQuestion = codingQuestions[currentQuestionIndex];

        return (
            <div className="dsa-interview-container">
                <div className="coding-header">
                    <div className="header-left">
                        <h2>{session.topic} - Coding Challenge</h2>
                        <div className="question-tabs">
                            {codingQuestions.map((q, idx) => (
                                <button
                                    key={idx}
                                    className={`tab ${idx === currentQuestionIndex ? 'active' : ''} ${submissions[idx] ? 'submitted' : ''}`}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                >
                                    Q{idx + 1}
                                    {submissions[idx] && <CheckCircle size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="timer">
                            <Clock size={20} />
                            {formatTime(timeRemaining)}
                        </div>
                        <button onClick={completeInterview} className="btn-end">
                            End Interview
                        </button>
                    </div>
                </div>

                <div className="coding-content">
                    <div className="problem-section">
                        <div className="problem-header">
                            <h3>{currentQuestion.title}</h3>
                            <span className={`difficulty ${currentQuestion.difficulty.toLowerCase()}`}>
                                {currentQuestion.difficulty}
                            </span>
                        </div>

                        <div className="problem-description">
                            <p>{currentQuestion.description}</p>
                        </div>

                        {currentQuestion.constraints && (
                            <div className="constraints">
                                <strong>Constraints:</strong>
                                <p>{currentQuestion.constraints}</p>
                            </div>
                        )}

                        <div className="examples">
                            <strong>Examples:</strong>
                            {currentQuestion.examples.map((ex, idx) => (
                                <div key={idx} className="example">
                                    <div><strong>Input:</strong> {ex.input}</div>
                                    <div><strong>Output:</strong> {ex.output}</div>
                                    {ex.explanation && <div><strong>Explanation:</strong> {ex.explanation}</div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="code-section">
                        <div className="code-header">
                            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                            </select>
                            <button onClick={submitCode} className="btn-submit-code">
                                <Send size={18} />
                                Submit Solution
                            </button>
                        </div>

                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="// Write your code here..."
                            className="code-editor"
                        />

                        {submissions[currentQuestionIndex] && (
                            <div className="submission-result">
                                <h4>Last Submission</h4>
                                <div className="result-item">
                                    <strong>Score:</strong> {submissions[currentQuestionIndex].score}/100
                                </div>
                                <div className="result-item">
                                    <strong>Code Quality:</strong> {submissions[currentQuestionIndex].analysis.codeQuality}/10
                                </div>
                                <div className="result-item">
                                    <strong>Time Complexity:</strong> {submissions[currentQuestionIndex].analysis.timeComplexity}
                                </div>
                                <div className="result-item">
                                    <strong>Space Complexity:</strong> {submissions[currentQuestionIndex].analysis.spaceComplexity}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Completed Phase - Scorecard
    if (phase === 'completed' && scorecard) {
        return (
            <div className="dsa-interview-container">
                <div className="scorecard">
                    <div className="scorecard-header">
                        <Award size={64} className="award-icon" />
                        <h1>Interview Complete!</h1>
                        <div className="final-score">
                            <div className="score-circle">
                                <span className="score-value">{scorecard.finalScore}</span>
                                <span className="score-label">/100</span>
                            </div>
                        </div>
                    </div>

                    <div className="scorecard-breakdown">
                        <h3>Score Breakdown</h3>
                        <div className="breakdown-grid">
                            <div className="breakdown-item">
                                <span className="label">Preliminary Questions</span>
                                <span className="value">{scorecard.breakdown.preliminaryScore}/100</span>
                            </div>
                            <div className="breakdown-item">
                                <span className="label">Coding Challenges</span>
                                <span className="value">{scorecard.breakdown.codingScore}/100</span>
                            </div>
                            <div className="breakdown-item">
                                <span className="label">Code Quality</span>
                                <span className="value">{scorecard.breakdown.codeQualityScore}/100</span>
                            </div>
                            <div className="breakdown-item">
                                <span className="label">Time Management</span>
                                <span className="value">{scorecard.breakdown.timeManagementScore}/100</span>
                            </div>
                        </div>
                    </div>

                    <div className="feedback-section">
                        <h3>Feedback</h3>
                        <p>{scorecard.feedback}</p>
                    </div>

                    <div className="recommendations-section">
                        <h3>Recommendations</h3>
                        <ul>
                            {scorecard.recommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="scorecard-actions">
                        <button onClick={() => navigate('/dashboard')} className="btn-primary">
                            Return to Dashboard
                        </button>
                        <button onClick={() => window.print()} className="btn-secondary">
                            Print Scorecard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default DSAInterview;
