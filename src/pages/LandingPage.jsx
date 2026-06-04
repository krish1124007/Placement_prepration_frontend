import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Terminal,
    Code2,
    BrainCircuit,
    LineChart,
    ChevronRight,
    CheckCircle2,
    Mic,
    MicOff,
    Video,
    VideoOff,
    Star,
    Trophy,
    Users,
    Zap,
    ArrowRight,
    Play,
    Shield,
    Clock,
    BarChart3,
    MessageSquare,
    Github,
    Linkedin,
    Bot,
    User
} from 'lucide-react';
import './LandingPage.css';

// ── Animated live interview widget ──────────────────────────────────────────
const InterviewWidget = () => {
    const messages = [
        { from: 'ai', text: "Hello Arjun! I'm your AI interviewer. Let's start with a classic — can you explain the difference between a stack and a queue?" },
        { from: 'user', text: "Sure! A stack is LIFO — Last In, First Out. Think of a stack of plates. A queue is FIFO — First In, First Out, like a line at a coffee shop." },
        { from: 'ai', text: "Great analogy! Now, can you implement a stack using two queues and explain the time complexity?" },
        { from: 'user', text: "Yes! We can use two queues where push() is O(1) and pop() is O(n) — we dequeue all from q1 to q2, dequeue the last element, then swap q1 and q2." },
        { from: 'ai', text: "Excellent! Perfect conceptual clarity. Let's move on to system design..." },
    ];

    const [visibleMessages, setVisibleMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);
    const chatRef = useRef(null);
    const msgIndex = useRef(0);

    useEffect(() => {
        let isCancelled = false;
        let currentTimer;

        const addMessage = () => {
            if (isCancelled) return;
            if (msgIndex.current >= messages.length) {
                msgIndex.current = 0;
                setVisibleMessages([]);
                currentTimer = setTimeout(addMessage, 1500);
                return;
            }
            setIsTyping(true);
            const msg = messages[msgIndex.current];
            const delay = msg.from === 'ai' ? 1800 : 1200;
            currentTimer = setTimeout(() => {
                if (isCancelled) return;
                setIsTyping(false);
                if (msg) {
                    setVisibleMessages(prev => [...prev, msg]);
                }
                msgIndex.current += 1;
                currentTimer = setTimeout(addMessage, 2000);
            }, delay);
        };
        currentTimer = setTimeout(addMessage, 800);
        return () => {
            isCancelled = true;
            clearTimeout(currentTimer);
        };
    }, []);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [visibleMessages, isTyping]);

    return (
        <div className="interview-widget">
            {/* Top bar */}
            <div className="iw-header">
                <div className="iw-header-left">
                    <div className="iw-live-dot"></div>
                    <span className="iw-live-text">LIVE SESSION</span>
                </div>
                <div className="iw-session-info">
                    <Clock size={13} /> <span>12:34</span>
                </div>
            </div>

            {/* Video panels */}
            <div className="iw-video-row">
                {/* Candidate */}
                <div className="iw-video-panel candidate">
                    <div className="iw-avatar-wrap">
                        <div className="iw-avatar candidate-av">
                            <User size={28} />
                        </div>
                        <div className="iw-sound-wave">
                            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                <div key={i} className="iw-bar" style={{ '--i': i }}></div>
                            ))}
                        </div>
                    </div>
                    <div className="iw-name-tag">
                        <span>Arjun Sharma</span>
                        <span className="iw-role-tag">Candidate</span>
                    </div>
                    <div className="iw-controls-mini">
                        <button className={`ctrl-btn ${!micOn ? 'off' : ''}`} onClick={() => setMicOn(!micOn)}>
                            {micOn ? <Mic size={14} /> : <MicOff size={14} />}
                        </button>
                        <button className={`ctrl-btn ${!videoOn ? 'off' : ''}`} onClick={() => setVideoOn(!videoOn)}>
                            {videoOn ? <Video size={14} /> : <VideoOff size={14} />}
                        </button>
                    </div>
                </div>

                {/* AI Interviewer */}
                <div className="iw-video-panel ai-panel">
                    <div className="iw-avatar-wrap">
                        <div className="iw-avatar ai-av">
                            <Bot size={28} />
                        </div>
                        <div className="iw-ai-rings">
                            <div className="ai-ring r1"></div>
                            <div className="ai-ring r2"></div>
                        </div>
                    </div>
                    <div className="iw-name-tag">
                        <span>AI Interviewer</span>
                        <span className="iw-role-tag ai">Powered by GPT-4</span>
                    </div>
                </div>
            </div>

            {/* Chat */}
            <div className="iw-chat" ref={chatRef}>
                {visibleMessages.map((msg, i) => (
                    <div key={i} className={`iw-msg ${msg.from}`}>
                        <div className="iw-msg-bubble">{msg.text}</div>
                    </div>
                ))}
                {isTyping && (
                    <div className="iw-msg ai">
                        <div className="iw-msg-bubble typing">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Main Landing Page ────────────────────────────────────────────────────────
const LandingPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const features = [
        { icon: <BrainCircuit size={32} />, title: 'AI-Driven Mock Interviews', desc: 'Simulate real-world interviews with an AI that adapts in real time — from behavioral rounds to system design.' },
        { icon: <Code2 size={32} />, title: 'Live DSA Practice', desc: 'Solve curated problems in our integrated coding environment with real-time feedback and optimal hints.' },
        { icon: <LineChart size={32} />, title: 'Performance Analytics', desc: 'Deep-dive into your scores, speech clarity, problem-solving speed and confidence over time.' },
        { icon: <Shield size={32} />, title: 'ATS Resume Builder', desc: 'Auto-generate and score your resume against real job descriptions and boost your ATS ranking.' },
        { icon: <BarChart3 size={32} />, title: 'Personalised Roadmaps', desc: 'Get an AI-curated study roadmap based on your target company, role, and current skill gaps.' },
        { icon: <MessageSquare size={32} />, title: 'Instant AI Feedback', desc: 'After every answer you get detailed, structured feedback — tone, accuracy, depth, and improvements.' },
    ];

    const steps = [
        { num: '01', title: 'Create your profile', desc: 'Sign up, pick your target role and dream companies.' },
        { num: '02', title: 'Run a mock interview', desc: 'Your AI interviewer asks curated questions and listens to your answers live.' },
        { num: '03', title: 'Get detailed feedback', desc: 'Review a full scorecard with strengths, gaps, and a study plan.' },
        { num: '04', title: 'Land the offer', desc: 'Repeat, improve, and walk into every interview with confidence.' },
    ];

    const testimonials = [
        { name: 'Priya K.', role: 'SDE-2 @ Google', text: 'interPrep\'s AI panel interview was shockingly close to my actual Google loop. The feedback pinpointed exactly where I was vague.', stars: 5 },
        { name: 'Rahul M.', role: 'Backend Engineer @ Amazon', text: 'I went from blanking on system design questions to confidently designing distributed systems. The roadmap feature is gold.', stars: 5 },
        { name: 'Sneha P.', role: 'Frontend Dev @ Microsoft', text: 'The DSA practice + AI interviewer combo is unbeatable. Got my offer in 3 weeks of prep. Absolutely recommend!', stars: 5 },
    ];

    return (
        <div className="landing-page">
            {/* ── Nav ── */}
            <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="landing-logo">
                    <Terminal size={26} className="logo-icon" />
                    <span>interPrep</span>
                </div>
                <div className="landing-nav-links">
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#how-it-works" className="nav-link">How it works</a>
                    <a href="#testimonials" className="nav-link">Reviews</a>
                    <button className="nav-btn" onClick={() => navigate('/login')}>Login</button>
                    <button className="nav-btn primary" onClick={() => navigate('/signup')}>Get Started Free</button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <header className="hero-section">
                {/* Floating blobs */}
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
                <div className="grid-overlay"></div>

                <div className="hero-inner">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <Zap size={14} /> Next-Gen AI Placement Platform
                        </div>
                        <h1 className="hero-title">
                            Ace Every<br />
                            <span className="text-highlight">Technical Interview</span><br />
                            with AI
                        </h1>
                        <p className="hero-subtitle">
                            Practice with a real-time AI interviewer, solve curated DSA problems, get instant feedback, and land your dream tech role — all in one platform.
                        </p>
                        <div className="hero-cta">
                            <button className="cta-btn primary" onClick={() => navigate('/signup')}>
                                <Play size={18} fill="currentColor" /> Start Free Practice
                            </button>
                            <button className="cta-btn secondary" onClick={() => navigate('/login')}>
                                View Demo <ArrowRight size={18} />
                            </button>
                        </div>
                        <div className="hero-trust">
                            <div className="trust-avatars">
                                {['A', 'R', 'S', 'P', 'K'].map((l, i) => (
                                    <div key={i} className="trust-av" style={{ '--n': i }}>{l}</div>
                                ))}
                            </div>
                            <div className="trust-text">
                                <div className="trust-stars">{[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}</div>
                                <span>Loved by <strong>10,000+</strong> students</span>
                            </div>
                        </div>
                    </div>

                    {/* Live interview widget */}
                    <div className="hero-visual">
                        <InterviewWidget />
                    </div>
                </div>
            </header>


            {/* ── Features ── */}
            <section className="features-section" id="features">
                <div className="section-header">
                    <div className="section-badge">Features</div>
                    <h2>Everything you need to <span className="text-highlight">land the offer</span></h2>
                    <p>A complete ecosystem built to transform your interview skills from zero to offer-ready.</p>
                </div>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <div key={i} className="feature-card" style={{ '--delay': `${i * 0.08}s` }}>
                            <div className="feature-icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                            <div className="feature-arrow"><ArrowRight size={18} /></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="how-section" id="how-it-works">
                <div className="section-header">
                    <div className="section-badge">Process</div>
                    <h2>How <span className="text-highlight">interPrep</span> works</h2>
                    <p>Four simple steps from signup to your dream offer.</p>
                </div>
                <div className="steps-row">
                    {steps.map((s, i) => (
                        <div key={i} className="step-card">
                            <div className="step-num">{s.num}</div>
                            <h3>{s.title}</h3>
                            <p>{s.desc}</p>
                            {i < steps.length - 1 && <div className="step-connector"><ArrowRight size={20} /></div>}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="testimonials-section" id="testimonials">
                <div className="section-header">
                    <div className="section-badge">Reviews</div>
                    <h2>Students who <span className="text-highlight">cracked it</span></h2>
                </div>
                <div className="testimonials-grid">
                    {testimonials.map((t, i) => (
                        <div key={i} className="testimonial-card">
                            <div className="t-stars">{[...Array(t.stars)].map((_, j) => <Star key={j} size={16} fill="#f59e0b" color="#f59e0b" />)}</div>
                            <p className="t-text">"{t.text}"</p>
                            <div className="t-author">
                                <div className="t-avatar">{t.name[0]}</div>
                                <div>
                                    <div className="t-name">{t.name}</div>
                                    <div className="t-role">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="cta-section">
                <div className="cta-blob cta-blob-1"></div>
                <div className="cta-blob cta-blob-2"></div>
                <div className="cta-inner">
                    <h2>Ready to ace your next interview?</h2>
                    <p>Join 10,000+ students already preparing smarter with interPrep.</p>
                    <button className="cta-btn primary large" onClick={() => navigate('/signup')}>
                        Get Started — It's Free <ChevronRight size={22} />
                    </button>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="landing-footer">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <Terminal size={22} className="logo-icon" />
                        <span>interPrep</span>
                    </div>
                    <div className="footer-links">
                        <a href="#features">Features</a>
                        <a href="#how-it-works">How it works</a>
                        <a href="#testimonials">Reviews</a>
                        <button onClick={() => navigate('/login')}>Login</button>
                    </div>
                    <div className="footer-social">
                        <a href="#"><Github size={20} /></a>
                        <a href="#"><Linkedin size={20} /></a>
                    </div>
                </div>
                <div className="footer-copy">&copy; 2026 interPrep. All rights reserved.</div>
            </footer>
        </div>
    );
};

export default LandingPage;
