// Speech Recognition (Speech-to-Text) Service
export class SpeechRecognitionService {
    recognition = null;
    isListening = false;
    onResultCallback = null;
    onEndCallback = null;

    constructor() {
        // Initialize Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error('Speech Recognition not supported in this browser');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            if (this.onResultCallback) {
                this.onResultCallback({
                    final: finalTranscript.trim(),
                    interim: interimTranscript.trim()
                });
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onEndCallback) {
                this.onEndCallback();
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
        };
    }

    start(onResult, onEnd) {
        if (!this.recognition) {
            console.error('Speech Recognition not available');
            return false;
        }

        this.onResultCallback = onResult;
        this.onEndCallback = onEnd;

        try {
            this.recognition.start();
            this.isListening = true;
            return true;
        } catch (error) {
            console.error('Error starting recognition:', error);
            return false;
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    isSupported() {
        return !!this.recognition;
    }
}


// Speech Synthesis (Text-to-Speech) Service - Enhanced Version
export class SpeechSynthesisService {
    synth = null;
    isSpeaking = false;
    currentUtterance = null;
    voices = [];
    voicesLoaded = false;

    constructor() {
        this.synth = window.speechSynthesis;

        // Load voices
        this.loadVoices();

        // Chrome loads voices asynchronously
        if (this.synth) {
            this.synth.onvoiceschanged = () => {
                this.loadVoices();
            };
        }
    }

    loadVoices() {
        if (!this.synth) return;

        this.voices = this.synth.getVoices();
        this.voicesLoaded = this.voices.length > 0;

        if (this.voicesLoaded) {
            console.log('🎤 Available voices loaded:', this.voices.length);
            // Log the best voices for debugging
            const bestVoices = this.getBestVoices();
            if (bestVoices.length > 0) {
                console.log('🌟 Best voices:', bestVoices.slice(0, 3).map(v => v.name));
            }
        }
    }

    selectBestVoice(lang = 'en-US') {
        if (!this.voicesLoaded || this.voices.length === 0) {
            this.loadVoices();
        }

        // Priority order for voice selection (highest to lowest quality)
        const priorities = [
            // Google Neural voices (best quality)
            (v) => v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('neural') && v.lang === lang,
            (v) => v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('us') && v.lang === lang,
            (v) => v.name.toLowerCase().includes('google') && v.lang === lang,

            // Enhanced/Premium voices
            (v) => v.name.toLowerCase().includes('enhanced') && v.lang === lang,
            (v) => v.name.toLowerCase().includes('premium') && v.lang === lang,
            (v) => v.name.toLowerCase().includes('natural') && v.lang === lang,

            // Microsoft Neural voices
            (v) => v.name.toLowerCase().includes('microsoft') && v.name.toLowerCase().includes('neural') && v.lang === lang,
            (v) => v.name.toLowerCase().includes('microsoft') && v.lang === lang,

            // Any neural voice
            (v) => v.name.toLowerCase().includes('neural') && v.lang === lang,

            // Fallback to language match
            (v) => v.lang === lang,
            (v) => v.lang.startsWith(lang.split('-')[0]),
        ];

        for (const priorityCheck of priorities) {
            const voice = this.voices.find(priorityCheck);
            if (voice) {
                console.log('✅ Selected voice:', voice.name, '| Language:', voice.lang);
                return voice;
            }
        }

        // Ultimate fallback
        console.warn('⚠️ Using default voice');
        return this.voices[0] || null;
    }

    speak(text, options = {}) {
        if (!this.synth) {
            console.error('Speech Synthesis not supported');
            return Promise.reject(new Error('Not supported'));
        }

        // Cancel any ongoing speech
        this.cancel();

        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);

            // Configure voice settings for natural, professional speech
            utterance.rate = options.rate || 0.95;    // Slightly slower for clarity
            utterance.pitch = options.pitch || 1.05;  // Slightly higher for friendliness
            utterance.volume = options.volume || 1.0;
            utterance.lang = options.lang || 'en-US';

            // Select the best available voice
            const bestVoice = this.selectBestVoice(utterance.lang);
            if (bestVoice) {
                utterance.voice = bestVoice;
            }

            utterance.onstart = () => {
                this.isSpeaking = true;
                console.log('🔊 AI Speaking:', text.substring(0, 50) + '...');
                if (options.onStart) options.onStart();
            };

            utterance.onend = () => {
                this.isSpeaking = false;
                this.currentUtterance = null;
                console.log('✓ Speech completed');
                if (options.onEnd) options.onEnd();
                resolve();
            };

            utterance.onerror = (error) => {
                this.isSpeaking = false;
                this.currentUtterance = null;
                console.error('❌ Speech error:', error);

                // Retry once if error occurred
                if (!options._retried) {
                    console.log('🔄 Retrying speech...');
                    setTimeout(() => {
                        this.speak(text, { ...options, _retried: true })
                            .then(resolve)
                            .catch(reject);
                    }, 300);
                } else {
                    reject(error);
                }
            };

            this.currentUtterance = utterance;

            // Small delay to ensure proper initialization
            setTimeout(() => {
                try {
                    this.synth.speak(utterance);
                } catch (err) {
                    console.error('Error speaking:', err);
                    reject(err);
                }
            }, 100);
        });
    }

    cancel() {
        if (this.synth) {
            this.synth.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
        }
    }

    pause() {
        if (this.synth && this.isSpeaking) {
            this.synth.pause();
        }
    }

    resume() {
        if (this.synth) {
            this.synth.resume();
        }
    }

    isSupported() {
        return !!this.synth;
    }

    getVoices() {
        return this.voices;
    }

    // Get sorted list of best voices
    getBestVoices(lang = 'en-US') {
        const filtered = this.voices.filter(v =>
            v.lang === lang || v.lang.startsWith(lang.split('-')[0])
        );

        return filtered.sort((a, b) => {
            const aScore = this.getVoiceQualityScore(a);
            const bScore = this.getVoiceQualityScore(b);
            return bScore - aScore;
        });
    }

    getVoiceQualityScore(voice) {
        let score = 0;
        const name = voice.name.toLowerCase();

        // Google voices get highest score
        if (name.includes('google')) score += 100;
        if (name.includes('neural')) score += 50;
        if (name.includes('enhanced')) score += 40;
        if (name.includes('premium')) score += 40;
        if (name.includes('natural')) score += 30;
        if (name.includes('microsoft')) score += 20;

        return score;
    }
}

// Create singleton instances
export const speechRecognition = new SpeechRecognitionService();
export const speechSynthesis = new SpeechSynthesisService();

// Pre-load voices on initialization
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        speechSynthesis.loadVoices();
    });
}
