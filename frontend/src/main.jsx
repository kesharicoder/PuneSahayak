import React, { useState, useRef, useEffect, Component } from 'react';
import {
  AlertCircle, ArrowLeft, ArrowRight, Bot, Building2, Camera, Check, ChevronDown, ClipboardList,
  Clock, Compass, FileText, Globe, Image, MapPin, Menu, MessageCircle, Mic, MicOff, Phone, Plus,
  Send, ShieldCheck, Sparkles, Trash2, Users, X, Zap,
} from 'lucide-react';
import { analyzeComplaint, analyzeComplaintImage, locationToText } from './services/apiClient';
import { downloadReportPdf } from './services/pdfReport';
import { languages, translations } from './i18n/translations';
import { puneAreas } from './data/puneWardsData';
import './styles.css';

function LanguageSelector({ lang, setLang }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentLang = languages.find((l) => l.code === lang) || languages[0];

  return (
    <div className="lang-dropdown-wrapper" ref={containerRef}>
      <button
        type="button"
        id="language-selector-button"
        className={`lang-toggle-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select website language"
      >
        <span className="status-dot" />
        <span>{currentLang.native}</span>
        <ChevronDown size={14} className={`lang-chevron ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="lang-dropdown-menu" role="listbox" aria-labelledby="language-selector-button">
          {languages.map((item) => {
            const isSelected = item.code === lang;
            return (
              <button
                key={item.code}
                id={`lang-option-${item.code}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`lang-item ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setLang(item.code);
                  setIsOpen(false);
                }}
              >
                <div className="lang-item-left">
                  <span>{item.native}</span>
                  {item.code !== 'en' && <span className="lang-item-native">({item.label})</span>}
                </div>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Header({ onHome, lang, setLang, t, compact = false }) {
  return (
    <header className="topbar">
      {compact && (
        <button className="header-back" type="button" onClick={onHome}>
          <ArrowLeft size={16} /> <span>{t.nav.back}</span>
        </button>
      )}
      <button className="brand" onClick={onHome} aria-label="Go to PuneSahayak home">
        <span className="brand-mark">पु</span>
        <span>Pune<span className="brand-accent">Sahayak</span></span>
      </button>
      <nav className={compact ? 'desktop-only' : ''} aria-label="Primary navigation">
        <a href="#how">{t.nav.howItWorks}</a>
        <a href="#insights">{t.nav.insights}</a>
      </nav>
      <LanguageSelector lang={lang} setLang={setLang} />
      <button className="menu-button" aria-label="Open menu"><Menu size={21} /></button>
    </header>
  );
}

function Stepper({ step, t }) {
  const steps = [
    ['01', t.stepper.step1],
    ['02', t.stepper.step2],
    ['03', t.stepper.step3],
  ];
  return (
    <div className="stepper" aria-label="Complaint progress">
      {steps.map(([number, label], index) => (
        <div className={`step ${step >= index ? 'active' : ''}`} key={label}>
          <span>{step > index ? <Check size={15} /> : number}</span>
          <b>{label}</b>
          {index < 2 && <i />}
        </div>
      ))}
    </div>
  );
}

function Feature({ icon, number, title, text }) {
  return (
    <div className="feature">
      <div className="feature-top">
        <div className="feature-icon" aria-hidden="true">{icon}</div>
        <span className="feature-number" aria-label={`Step ${number}`}>Step {number}</span>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Home({ onStart, onInsights, lang, setLang, t }) {
  return (
    <>
      <Header onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} lang={lang} setLang={setLang} t={t} />
      <main className="home-shell">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pulse" /> {t.hero.eyebrow}</div>
            <h1>
              {t.hero.line1}<br />
              <em>{t.hero.line2}</em><br />
              {t.hero.line3Prefix}<span className="underlined">{t.hero.line3Highlight}</span>
            </h1>
            <p className="hero-lead">{t.hero.lead}</p>
            <div className="hero-actions">
              <button id="hero-report-button" className="primary-button" onClick={onStart}>
                {t.hero.reportBtn} <ArrowRight size={18} />
              </button>
              <button id="hero-insights-button" className="text-button" onClick={onInsights}>
                {t.hero.insightsBtn} <ArrowRight size={16} />
              </button>
            </div>
            <div className="trust-line">
              <ShieldCheck size={18} />
              <span>{t.hero.privateBadge}</span>
              <span className="separator">·</span>
              <span>{t.hero.langsBadge}</span>
            </div>
          </div>
          <div className="hero-art" aria-label="Illustration of Pune civic life">
            <div className="sun" />
            <div className="hill hill-one" />
            <div className="hill hill-two" />
            <div className="tree tree-one">✦</div>
            <div className="tree tree-two">✦</div>
            <div className="road"><span /><span /><span /></div>
            <div className="illustration-card">
              <MapPin size={16} />
              <b>{t.hero.cardLocation}</b>
              <small>{t.hero.cardIssues}</small>
            </div>
          </div>
        </section>

        <section className="home-lower" id="how">
          <div className="section-intro">
            <span className="eyebrow">{t.howItWorks.eyebrow}</span>
            <h2>{t.howItWorks.title1}<br /><em>{t.howItWorks.title2}</em></h2>
          </div>
          <div className="feature-grid">
            <Feature icon={<MessageCircle />} number="01" title={t.howItWorks.step1Title} text={t.howItWorks.step1Text} />
            <Feature icon={<Sparkles />} number="02" title={t.howItWorks.step2Title} text={t.howItWorks.step2Text} />
            <Feature icon={<ClipboardList />} number="03" title={t.howItWorks.step3Title} text={t.howItWorks.step3Text} />
          </div>
        </section>

        <section className="insight-tease" id="insights">
          <div>
            <span className="eyebrow">{t.communityTease.eyebrow}</span>
            <h2>{t.communityTease.title1}<br /><em>{t.communityTease.title2}</em></h2>
            <p>{t.communityTease.text}</p>
          </div>
          <div className="mini-stats">
            <div><strong>{t.communityTease.stat1Number}</strong><span>{t.communityTease.stat1Label}</span></div>
            <div><strong>{t.communityTease.stat2Number}</strong><span>{t.communityTease.stat2Label}</span></div>
          </div>
          <button className="dark-button" onClick={onInsights}>
            {t.communityTease.exploreBtn} <ArrowRight size={17} />
          </button>
        </section>
      </main>
      <footer>
        <span>{t.footer.copyright}</span>
        <span>{t.footer.madeWith} <span className="heart">♥</span></span>
      </footer>
    </>
  );
}

function CameraModal({ isOpen, onClose, onCapture, t }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let activeStream = null;

    async function startCamera() {
      setCameraError('');
      setCapturedDataUrl(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(t.form.cameraPermissionError);
        return;
      }

      try {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoDevices.length > 1);
        } catch {}

        const constraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = stream;
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          activeStream = fallbackStream;
          streamRef.current = fallbackStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            await videoRef.current.play().catch(() => {});
          }
        } catch {
          setCameraError(t.form.cameraPermissionError);
        }
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, facingMode, t]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedDataUrl(dataUrl);
    stopStream();
  };

  const handleRetake = () => {
    setCapturedDataUrl(null);
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleConfirm = () => {
    if (!capturedDataUrl) return;
    fetch(capturedDataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `civic-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        handleClose();
      });
  };

  const handleClose = () => {
    stopStream();
    setCapturedDataUrl(null);
    setCameraError('');
    onClose();
  };

  const toggleFacingMode = () => {
    stopStream();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="camera-modal-backdrop" onClick={handleClose}>
      <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
        <div className="camera-modal-header">
          <div>
            <h3>{t.form.cameraModalTitle}</h3>
            <p>{t.form.cameraModalSub}</p>
          </div>
          <button type="button" className="camera-close-button" onClick={handleClose} aria-label="Close camera">
            <X size={18} />
          </button>
        </div>

        {cameraError ? (
          <div className="camera-error-container">
            <AlertCircle size={36} style={{ color: '#d34533', margin: '0 auto' }} />
            <p>{cameraError}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  handleClose();
                  document.getElementById('issue-image')?.click();
                }}
              >
                <Image size={16} /> {t.form.uploadImage}
              </button>
              <button type="button" className="outline-button" onClick={handleClose}>
                {t.nav.back || 'Cancel'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="camera-viewfinder-container">
              {capturedDataUrl ? (
                <img src={capturedDataUrl} alt="Captured preview" className="camera-captured-image" />
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
                  <div className="camera-crosshairs">
                    <span className="camera-corner-tl" />
                    <span className="camera-corner-tr" />
                    <span className="camera-corner-bl" />
                    <span className="camera-corner-br" />
                  </div>
                </>
              )}
            </div>

            <div className="camera-controls-bar">
              {capturedDataUrl ? (
                <>
                  <button type="button" className="camera-icon-button" onClick={handleRetake}>
                    <ArrowLeft size={16} /> {t.form.retakePhoto}
                  </button>
                  <button type="button" className="primary-button" onClick={handleConfirm}>
                    <Check size={16} /> {t.form.usePhoto}
                  </button>
                </>
              ) : (
                <>
                  {hasMultipleCameras ? (
                    <button type="button" className="camera-icon-button" onClick={toggleFacingMode} title={t.form.switchCamera}>
                      <Compass size={16} /> {t.form.switchCamera}
                    </button>
                  ) : (
                    <div style={{ width: 80 }} />
                  )}

                  <button
                    type="button"
                    id="camera-shutter-btn"
                    className="camera-shutter-button"
                    onClick={handleCapture}
                    aria-label={t.form.capturePhoto}
                  >
                    <Camera size={26} />
                  </button>

                  <button type="button" className="camera-icon-button" onClick={handleClose}>
                    {t.nav.back || 'Cancel'}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function detectSpokenLanguage(str) {
  if (!str || !str.trim()) return null;

  const devanagariMatches = str.match(/[\u0900-\u097F]/g) || [];
  const latinMatches = str.match(/[a-zA-Z]/g) || [];

  if (latinMatches.length > devanagariMatches.length) {
    return { code: 'en', name: 'English', native: 'English' };
  }

  if (devanagariMatches.length > 0) {
    // Unique Marathi character: ळ (U+0933)
    if (/[\u0933]/.test(str)) {
      return { code: 'mr', name: 'Marathi', native: 'मराठी' };
    }

    const marathiWords = [
      'आहे', 'आहेत', 'नाही', 'नाहीये', 'झाले', 'झाली', 'झाला', 'केले', 'केली', 'केला',
      'करा', 'करू', 'द्या', 'पडला', 'पडले', 'पडली', 'खड्डा', 'खड्डे', 'रस्ता', 'रस्ते',
      'पाणी', 'कचरा', 'दिवा', 'दिवे', 'तक्रार', 'पाहिजे', 'वारंवार', 'घंटागाडी', 'सांडपाणी',
      'पुण्यात', 'येथे', 'बघायला', 'होत', 'होते', 'होती', 'सगळं', 'चालतं'
    ];

    const hindiWords = [
      'है', 'हैं', 'नहीं', 'हुआ', 'हुई', 'हुए', 'किया', 'की', 'किए',
      'करो', 'करें', 'दीजिए', 'पड़ा', 'पड़े', 'पड़ी', 'गड्ढा', 'गड्ढे', 'सड़क', 'सड़कें',
      'पानी', 'कचरा', 'लाइट', 'शिकायत', 'चाहिए', 'बार-बार', 'गाड़ी', 'नाली',
      'पुणे में', 'यहाँ', 'देखने', 'था', 'थी', 'थे', 'सब', 'चलेगा'
    ];

    const lower = str.toLowerCase();
    let mrScore = 0;
    let hiScore = 0;

    marathiWords.forEach((w) => {
      if (lower.includes(w)) mrScore++;
    });
    hindiWords.forEach((w) => {
      if (lower.includes(w)) hiScore++;
    });

    if (mrScore > hiScore) {
      return { code: 'mr', name: 'Marathi', native: 'मराठी' };
    }
    if (hiScore > mrScore) {
      return { code: 'hi', name: 'Hindi', native: 'हिंदी' };
    }

    return { code: 'mr', name: 'Marathi / Hindi', native: 'मराठी / हिंदी' };
  }

  return null;
}

function ComplaintForm({ onAnalyze, onBack, initialComplaint, lang, setLang, t }) {
  const [text, setText] = useState(initialComplaint?.text || '');
  const defaultLoc = lang === 'hi' || lang === 'mr' ? 'कोथरूड, पुणे' : 'Kothrud, Pune';
  const initialLoc = typeof initialComplaint?.location === 'string'
    ? initialComplaint.location
    : initialComplaint?.location?.address || defaultLoc;
  const [location, setLocation] = useState(initialLoc);
  const [category, setCategory] = useState(initialComplaint?.category || '');
  const [image, setImage] = useState(initialComplaint?.image || null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef(null);
  const canContinue = text.trim().length > 10;

  // Voice speech-to-text and language understanding
  const [isListening, setIsListening] = useState(false);
  const initialVoiceLang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
  const [voiceLang, setVoiceLang] = useState(initialVoiceLang);
  const [detectedVoiceLang, setDetectedVoiceLang] = useState(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);
  const textRef = useRef(text);
  const voiceBaseTextRef = useRef(text.trim());
  const voiceFinalTextRef = useRef('');
  const voiceInterimTextRef = useRef('');
  const shouldKeepListeningRef = useRef(false);
  const restartTimerRef = useRef(null);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    const mapped = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    setVoiceLang(mapped);
  }, [lang]);

  useEffect(() => {
    if (text) {
      const detected = detectSpokenLanguage(text);
      if (detected) setDetectedVoiceLang(detected);
    }
  }, []);

  const stopListening = () => {
    shouldKeepListeningRef.current = false;
    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
    voiceBaseTextRef.current = textRef.current.trim();
    voiceFinalTextRef.current = '';
    voiceInterimTextRef.current = '';
  };

  const startListening = (targetLang = voiceLang) => {
    setVoiceError('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError(t.form.voiceNotSupported || 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    shouldKeepListeningRef.current = true;
    voiceBaseTextRef.current = textRef.current.trim();
    voiceFinalTextRef.current = '';
    voiceInterimTextRef.current = '';

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = targetLang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let currentInterim = '';

        // Process only new results and keep committed speech in a ref. This
        // prevents duplicated phrases when the browser restarts recognition
        // after a short pause.
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += `${piece} `;
          } else {
            currentInterim += `${piece} `;
          }
        }

        finalTranscript = finalTranscript.trim();
        currentInterim = currentInterim.trim();
        if (finalTranscript) {
          voiceFinalTextRef.current = [voiceFinalTextRef.current, finalTranscript]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
        voiceInterimTextRef.current = currentInterim;

        const visibleTranscript = [
          voiceBaseTextRef.current,
          voiceFinalTextRef.current,
          voiceInterimTextRef.current,
        ]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (visibleTranscript) {
          textRef.current = visibleTranscript;
          setText(visibleTranscript);
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
          const detected = detectSpokenLanguage(`${voiceFinalTextRef.current} ${currentInterim}`);
          if (detected) setDetectedVoiceLang(detected);
        }

        if (finalTranscript) {
          const detected = detectSpokenLanguage(finalTranscript);
          if (detected) setDetectedVoiceLang(detected);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          shouldKeepListeningRef.current = false;
          setVoiceError(t.form.voicePermissionDenied || 'Microphone access denied. Please allow microphone permission in your browser.');
          setIsListening(false);
        } else if (event.error === 'audio-capture') {
          shouldKeepListeningRef.current = false;
          setVoiceError('No microphone was found. Connect a microphone and try again.');
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          // A pause is normal. onend will restart recognition while listening.
        } else if (event.error === 'aborted') {
          // Expected when the user presses the stop button.
        } else {
          shouldKeepListeningRef.current = false;
          setVoiceError(`Voice error: ${event.error}`);
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setInterimTranscript('');
        if (shouldKeepListeningRef.current) {
          const committedText = [
            voiceBaseTextRef.current,
            voiceFinalTextRef.current,
            voiceInterimTextRef.current,
          ]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          textRef.current = committedText;
          setText(committedText);
          voiceBaseTextRef.current = committedText;
          voiceFinalTextRef.current = '';
          voiceInterimTextRef.current = '';
          // Browser speech services commonly end after a short pause. Restart
          // with a fresh recognition object so result indexes start cleanly.
          restartTimerRef.current = window.setTimeout(() => {
            if (!shouldKeepListeningRef.current) return;
            recognitionRef.current = null;
            startListening(targetLang);
          }, 180);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setVoiceError(err.message || 'Could not initialize speech recognition.');
      setIsListening(false);
    }
  };

  const handleVoiceLangChange = (newLang) => {
    setVoiceLang(newLang);
    if (isListening) {
      stopListening();
      window.setTimeout(() => startListening(newLang), 120);
    }
  };

  useEffect(() => {
    return () => {
      shouldKeepListeningRef.current = false;
      if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    if (!image) {
      setImagePreview('');
      return undefined;
    }
    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError(t.form.imageTypeError);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError(t.form.imageSizeError);
      return;
    }
    setImageError('');
    setImage(file);
  };

  const removeImage = () => {
    setImage(null);
    setImageError('');
  };

  const handleAnalyze = () => {
    onAnalyze({ text, location: location.trim(), category, image });
  };

  return (
    <>
      <Header onHome={onBack} compact lang={lang} setLang={setLang} t={t} />
      <main className="flow-shell">
        <Stepper step={0} t={t} />
        <div className="flow-heading">
          <span className="eyebrow">{t.form.stepLabel}</span>
          <h1>{t.form.heading}</h1>
          <p>{t.form.subheading} <b>{t.form.languageHint}</b></p>
        </div>
        <div className="form-card">
          <label htmlFor="complaint">{t.form.labelIssue}</label>
          <div className="textarea-wrap">
            <textarea
              id="complaint"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                const detected = detectSpokenLanguage(e.target.value);
                if (detected) setDetectedVoiceLang(detected);
              }}
              placeholder={t.form.placeholder}
              maxLength={500}
            />
            <button
              type="button"
              className={`mic-button ${isListening ? 'listening' : ''}`}
              onClick={() => (isListening ? stopListening() : startListening())}
              aria-label={isListening ? 'Stop voice recording' : (t.form.voiceInput || 'Voice input')}
              aria-pressed={isListening}
              title={isListening ? 'Stop voice recording' : (t.form.voiceInput || 'Voice input (Marathi, Hindi, or English)')}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <span className="counter">{text.length}/500</span>
          </div>

          {/* Active Voice Assistant Panel */}
          {isListening && (
            <div className="voice-active-panel" role="region" aria-live="polite">
              <div className="voice-status-row">
                <div className="voice-indicator">
                  <span className="voice-pulse-dot" />
                  <span>{t.form.voiceListening || 'Listening...'}</span>
                  <span className="voice-soundwave" aria-hidden="true">
                    <span /><span /><span /><span />
                  </span>
                </div>

                <div className="voice-lang-chips" role="group" aria-label="Select speaking language">
                  <span className="voice-lang-label">{t.form.voiceSpeakingIn || 'Speaking in'}:</span>
                  <button
                    type="button"
                    className={`voice-lang-chip ${voiceLang === 'mr-IN' ? 'active' : ''}`}
                    onClick={() => handleVoiceLangChange('mr-IN')}
                  >
                    🇮🇳 {t.form.voiceLangMarathi || 'मराठी'}
                  </button>
                  <button
                    type="button"
                    className={`voice-lang-chip ${voiceLang === 'hi-IN' ? 'active' : ''}`}
                    onClick={() => handleVoiceLangChange('hi-IN')}
                  >
                    🇮🇳 {t.form.voiceLangHindi || 'हिंदी'}
                  </button>
                  <button
                    type="button"
                    className={`voice-lang-chip ${voiceLang === 'en-IN' ? 'active' : ''}`}
                    onClick={() => handleVoiceLangChange('en-IN')}
                  >
                    🌐 {t.form.voiceLangEnglish || 'English'}
                  </button>
                </div>

                <button
                  type="button"
                  className="voice-stop-button"
                  onClick={stopListening}
                >
                  <Check size={14} /> {t.form.voiceStop || 'Done'}
                </button>
              </div>

              {interimTranscript && (
                <div className="voice-interim-preview">
                  <span className="voice-interim-text">“{interimTranscript}”</span>
                  {detectedVoiceLang && (
                    <span className="voice-detected-tag">
                      {t.form.voiceDetectedLang || 'Detected'}: <b>{detectedVoiceLang.native}</b>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {voiceError && (
            <div className="voice-error-banner" role="alert">
              <span>{voiceError}</span>
              <button type="button" onClick={() => setVoiceError('')} aria-label="Dismiss">✕</button>
            </div>
          )}

          {!isListening && detectedVoiceLang && text.trim().length > 0 && (
            <div>
              <span className="voice-detected-badge-static">
                🗣️ {t.form.voiceDetectedLang || 'Language'}: {detectedVoiceLang.native}
              </span>
            </div>
          )}
          <div className="examples">
            <span>{t.form.tryExample}</span>
            {t.form.examples.map((example) => (
              <button key={example} type="button" onClick={() => setText(example)}>
                {example.slice(0, 34)}…
              </button>
            ))}
          </div>
          <div className="image-upload-section">
            <div className="image-upload-heading">
              <label htmlFor="issue-image">{t.form.imageLabel}</label>
              <span>{t.form.imageOptional}</span>
            </div>
            <input
              ref={fileInputRef}
              id="issue-image"
              className="visually-hidden"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {!imagePreview ? (
              <div className="image-upload-actions">
                <button
                  type="button"
                  id="upload-file-button"
                  className="outline-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image size={17} /> {t.form.uploadImage}
                </button>
                <button
                  type="button"
                  id="open-camera-button"
                  className="outline-button"
                  onClick={() => setIsCameraOpen(true)}
                >
                  <Camera size={17} /> {t.form.takePhoto}
                </button>
              </div>
            ) : (
              <div className="image-preview-card">
                <div className="image-preview-details">
                  <b>{image.name}</b>
                  <span>{t.form.imageAttached}</span>
                  <button type="button" className="remove-image-button" onClick={removeImage}>
                    <Trash2 size={15} /> {t.form.removeImage}
                  </button>
                </div>
              </div>
            )}
            {imageError && <p className="field-error" role="alert">{imageError}</p>}
          </div>

          <CameraModal
            isOpen={isCameraOpen}
            onClose={() => setIsCameraOpen(false)}
            onCapture={(file) => {
              setImage(file);
              setImageError('');
            }}
            t={t}
          />
          <div className="form-row">
            <div>
              <label htmlFor="location">
                <MapPin size={16} /> {t.form.labelLocation}
              </label>
              <div className="input-with-icon">
                <MapPin size={17} />
                <input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={lang === 'hi' || lang === 'mr' ? 'उदा. कोथरूड, पुणे' : 'e.g. Kothrud, Pune'}
                />
              </div>
              <div className="pune-area-quick-picks" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {['Kothrud', 'Shivajinagar', 'Viman Nagar', 'Baner', 'Hadapsar'].map((areaName) => (
                  <button
                    key={areaName}
                    type="button"
                    onClick={() => setLocation(`${areaName}, Pune`)}
                    style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', border: '1px solid #dce2da', background: '#f8faf8', color: '#174b35', cursor: 'pointer' }}
                  >
                    📍 {areaName}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="category">
                {t.form.labelCategory}
              </label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">{t.form.selectCategory}</option>
                <option value="Roads & footpaths">{t.form.catRoads}</option>
                <option value="Waste management">{t.form.catWaste}</option>
                <option value="Water supply">{t.form.catWater}</option>
                <option value="Street lights">{t.form.catLights}</option>
                <option value="Traffic & signals">{t.form.catTraffic}</option>
                <option value="Drainage & sewerage">{t.form.catDrainage}</option>
              </select>
            </div>
          </div>
           <button
             type="button"
             id="submit-analysis-button"
             className="primary-button continue-button"
             disabled={!canContinue}
             onClick={handleAnalyze}
           >
            {t.form.submitBtn} <ArrowRight size={18} />
          </button>
        </div>
        <p className="privacy-note">
          <ShieldCheck size={15} /> {t.form.privacyNotice}
        </p>
      </main>
    </>
  );
}

function Analysis({ complaint, result, loading, error, onReview, onFollowUp, onRetry, onBack, conversation, lang, setLang, t }) {
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const waitingForResult = loading || (!result && !error);
  const missingInformation = result?.missingInformation || [];
  const needsFollowUp = Boolean(result && missingInformation.length);
  const followUpQuestion = missingInformation[0]
    ? /\?$/.test(missingInformation[0])
      ? missingInformation[0]
      : `Can you share ${missingInformation[0].replace(/^exact\s+/i, 'the exact ')}?`
    : '';

  useEffect(() => {
    setFollowUpAnswer('');
  }, [result]);

  const submitFollowUp = () => {
    const answer = followUpAnswer.trim();
    if (answer) onFollowUp(answer);
  };

  return (
    <>
      <Header onHome={onBack} compact lang={lang} setLang={setLang} t={t} />
      <main className="flow-shell">
        <Stepper step={1} t={t} />
        <div className="flow-heading">
          <span className="eyebrow">{t.analysis.stepLabel}</span>
          <h1>{error ? 'We couldn’t analyze this yet.' : result ? t.analysis.heading : 'Reading your report…'}</h1>
          <p>{error || (result ? t.analysis.subheading : 'Your complaint is being sent to the analysis service. This may take a moment.')}</p>
        </div>
        <div className="analysis-grid">
          <div className="analysis-main">
            {waitingForResult && <>
              <div className="loading-badge">
                <span className="spinner" /> {t.analysis.analyzingBadge}
              </div>
              <div className="analysis-card">
                <div className="analysis-card-top">
                  <div className="spark-icon"><Sparkles size={19} /></div>
                  <div>
                    <span className="muted-label">ANALYSIS IN PROGRESS</span>
                    <h2>Analyzing your complaint…</h2>
                  </div>
                </div>
                <p>We’ll show the department, urgency and next steps when the backend returns a result.</p>
              </div>
            </>}
            {error && <div className="analysis-card analysis-error-card" role="alert">
              <div className="analysis-card-top">
                <div className="spark-icon"><Zap size={19} /></div>
                <div>
                  <span className="muted-label">ANALYSIS UNAVAILABLE</span>
                  <h2>We couldn’t get a result.</h2>
                </div>
              </div>
              <p>{error}</p>
              <div className="review-actions">
                <button className="primary-button" onClick={onRetry}>Try again <ArrowRight size={17} /></button>
                <button className="outline-button" onClick={onBack}><ArrowLeft size={17} /> {t.analysis.editBtn}</button>
              </div>
            </div>}
             {result && <>
              <div className="analysis-card">
                <div className="analysis-card-top">
                  <div className="spark-icon"><Sparkles size={19} /></div>
                  <div>
                    <span className="muted-label">{t.analysis.summaryLabel}</span>
                    <h2>{result.summary}</h2>
                  </div>
                </div>
                <div className="tag-row">
                  <span className="tag green"><ClipboardList size={14} /> {result.category}</span>
                  <span className="tag yellow"><Zap size={14} /> {result.urgency} {t.analysis.urgencySuffix}</span>
                </div>
              </div>
               <div className="action-list">
                <h3>{t.analysis.stepsTitle}</h3>
                {result.actions.length ? result.actions.map((action, i) => (
                  <div className="action-item" key={`${action}-${i}`}>
                    <span>{i + 1}</span>
                    {action}
                    <Check size={17} />
                  </div>
                 )) : <p>The analysis did not include specific next steps. Review the generated report for details.</p>}
               </div>
               {conversation?.length > 0 && (
                 <div className="conversation-context">
                   <span className="muted-label">{t.analysis.contextLabel}</span>
                   {conversation.map((message, index) => (
                     <div className="conversation-message" key={`${message.role}-${index}`}>
                       <span>{message.role === 'assistant' ? 'PuneSahayak' : t.analysis.youLabel}</span>
                       <p>{message.content}</p>
                     </div>
                   ))}
                 </div>
               )}
               {needsFollowUp && (
                 <div className="follow-up-card">
                   <div className="follow-up-heading">
                     <div className="spark-icon"><MessageCircle size={19} /></div>
                     <div>
                       <span className="muted-label">{t.analysis.followUpLabel}</span>
                       <h3>{t.analysis.followUpHeading}</h3>
                     </div>
                   </div>
                    <p className="follow-up-question">{followUpQuestion}</p>
                   <label className="visually-hidden" htmlFor="follow-up-answer">{t.analysis.followUpAnswerLabel}</label>
                   <textarea
                     id="follow-up-answer"
                     value={followUpAnswer}
                     onChange={(event) => setFollowUpAnswer(event.target.value)}
                     placeholder={t.analysis.followUpPlaceholder}
                     rows={3}
                     maxLength={500}
                   />
                   <button type="button" className="primary-button" disabled={!followUpAnswer.trim()} onClick={submitFollowUp}>
                     {t.analysis.followUpSubmit} <ArrowRight size={17} />
                   </button>
                   <small>{t.analysis.followUpProgress(missingInformation.length)}</small>
                 </div>
               )}
             </>}
          </div>
          <aside className="detail-card">
            <span className="muted-label">{t.analysis.routeToLabel}</span>
            <div className="department">
              <div className="department-icon"><Users size={20} /></div>
              <div>
                <b>{result?.department || 'Waiting for analysis'}</b>
                <small>{result ? t.analysis.pmcSub : 'The department will appear here after analysis.'}</small>
              </div>
            </div>
            <div className="detail-location">
               <MapPin size={16} /> {result?.location || locationToText(complaint?.location) || 'Location not provided'}
            </div>
            <button className="edit-button" onClick={onBack}>
              <ArrowLeft size={15} /> {t.analysis.editBtn}
            </button>
          </aside>
        </div>
        {result && !needsFollowUp && <button id="review-report-button" className="primary-button continue-button review-button" onClick={onReview}>
          {t.analysis.reviewBtn} <ArrowRight size={18} />
        </button>}
      </main>
    </>
  );
}

function Review({ complaint, result, onBack, onDone, lang, setLang, t }) {
  const [shared, setShared] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const recommendedAction = result.actions.length ? `${result.actions.join('. ')}.` : result.report;

  const generateReport = async () => {
    setGenerating(true);
    setDownloadError('');
    try {
      await downloadReportPdf(complaint, result);
      setShared(true);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : t.review.downloadError);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Header onHome={onBack} compact lang={lang} setLang={setLang} t={t} />
      <main className="flow-shell">
        <Stepper step={2} t={t} />
        <div className="flow-heading">
          <span className="eyebrow">{t.review.stepLabel}</span>
          <h1>{t.review.heading}</h1>
          <p>{t.review.subheading}</p>
        </div>
        <div className="report-card">
          <div className="report-head">
            <div className="report-logo">पु</div>
            <div>
              <span className="muted-label">{t.review.badgePrefix}</span>
              <h2>{t.review.reportTitlePrefix}{result.location.split(',')[0]}</h2>
            </div>
            <span className="draft-pill">{t.review.draftPill}</span>
          </div>
          <div className="report-meta">
            <span><MapPin size={15} /> {result.location}</span>
            <span><ClipboardList size={15} /> {result.category}</span>
            <span><Zap size={15} /> {result.urgency} {t.analysis.urgencySuffix}</span>
          </div>
          <div className="report-body">
            <span className="muted-label">{t.review.yourReportLabel}</span>
            <p>“{complaint.text}”</p>
          </div>
          <div className="report-language-grid">
            <div className="report-body report-language-card">
              <span className="muted-label">REPORT (ENGLISH)</span>
              <p>{result.englishReport}</p>
            </div>
            <div className="report-body report-language-card">
              <span className="muted-label">REPORT (मराठी)</span>
              <p>{result.marathiReport}</p>
            </div>
          </div>
          <div className="report-body">
            <span className="muted-label">{t.review.recommendedActionLabel}</span>
            <p>{recommendedAction}</p>
          </div>
          <div className="report-body disclaimer-block">
            <span className="muted-label">{t.review.disclaimerLabel}</span>
            <p>{result.disclaimer || t.review.disclaimerText}</p>
          </div>
        </div>
        <div className="review-actions">
          <button className="outline-button" onClick={onBack}>
            <ArrowLeft size={17} /> {t.review.makeEditsBtn}
          </button>
          <button id="share-report-button" className="primary-button" disabled={generating} onClick={generateReport}>
            {generating ? (
              <><span className="spinner" /> {t.review.generatingBtn}</>
            ) : shared ? (
              <><Check size={17} /> {t.review.sharedBtn}</>
            ) : (
              <><FileText size={17} /> {t.review.shareBtn}</>
            )}
          </button>
        </div>
        {downloadError && <div className="analysis-error-card report-download-error" role="alert">{downloadError}</div>}
        {shared && (
          <div className="success-message">
            <Check size={19} />
            <div>
              <b>{t.review.successHeading}</b>
              <span>{result.reference ? <>{t.review.successText}<strong>{result.reference}</strong>{t.review.successSub}</> : t.review.downloadSuccess}</span>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function Insights({ onBack, lang, setLang, t }) {
  const [selectedAreaId, setSelectedAreaId] = useState('all');
  const [isAreaPickerOpen, setIsAreaPickerOpen] = useState(false);
  const areaPickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (areaPickerRef.current && !areaPickerRef.current.contains(event.target)) {
        setIsAreaPickerOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsAreaPickerOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentArea = puneAreas.find((a) => a.id === selectedAreaId) || puneAreas[0];
  const areaName = currentArea.name[lang] || currentArea.name.en;
  const areaZone = currentArea.zone[lang] || currentArea.zone.en;
  const wardOfficeAddress = currentArea.wardOffice[lang] || currentArea.wardOffice.en;
  const trendText = lang === 'hi' ? currentArea.trendHi : lang === 'mr' ? currentArea.trendMr : currentArea.trend;
  const avgDaysText = lang === 'hi' ? currentArea.avgDaysHi : lang === 'mr' ? currentArea.avgDaysMr : currentArea.avgResolutionDays;
  const topicList = currentArea.topics[lang] || currentArea.topics.en;

  return (
    <>
      <Header onHome={onBack} compact lang={lang} setLang={setLang} t={t} />
      <main className="insights-page">
        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={16} /> {t.insights.backBtn}
        </button>

        <div className="flow-heading">
          <span className="eyebrow">{t.insights.eyebrow}</span>
          <h1>{t.insights.heading}</h1>
          <p>{t.insights.subheading}</p>
        </div>

        {/* Selected Area Header with Active Badge & Change Area Picker */}
        <div className="neighbourhood-card" style={{ marginTop: '10px' }}>
          <div>
            <span className="eyebrow">{t.insights.watchEyebrow}</span>
            <h2>{areaName}</h2>
            <p>{areaZone}</p>
            <div className="area-badges-row">
              <span className="area-badge-pill">
                <MapPin size={13} /> {areaName}
              </span>
              <span className="area-badge-pill">
                <Clock size={13} /> {t.insights.avgResolutionLabel}: {avgDaysText}
              </span>
            </div>
          </div>

          <div className="area-picker-wrapper" ref={areaPickerRef}>
            <button
              type="button"
              id="change-area-button"
              className={`area-select-button ${isAreaPickerOpen ? 'open' : ''}`}
              onClick={() => setIsAreaPickerOpen(!isAreaPickerOpen)}
              aria-expanded={isAreaPickerOpen}
              aria-haspopup="listbox"
            >
              <Compass size={16} />
              <span>{t.insights.changeAreaBtn}</span>
              <ChevronDown size={15} className={`lang-chevron ${isAreaPickerOpen ? 'rotated' : ''}`} />
            </button>

            {isAreaPickerOpen && (
              <div className="area-dropdown-popover" role="listbox">
                <div className="area-dropdown-header">
                  <span>{t.insights.selectWard}</span>
                  <span>{puneAreas.length} AREAS</span>
                </div>
                {puneAreas.map((area) => {
                  const isSelected = area.id === selectedAreaId;
                  const itemLabel = area.name[lang] || area.name.en;
                  const itemZone = area.zone[lang] || area.zone.en;
                  return (
                    <button
                      key={area.id}
                      type="button"
                      id={`ward-option-${area.id}`}
                      role="option"
                      aria-selected={isSelected}
                      className={`area-option-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedAreaId(area.id);
                        setIsAreaPickerOpen(false);
                      }}
                    >
                      <div className="area-option-top">
                        <span>{itemLabel}</span>
                        {isSelected && <Check size={15} />}
                      </div>
                      <span className="area-option-zone">{itemZone}</span>
                      <div className="area-option-meta">
                        <span>{area.totalReports} reports</span>
                        <span>·</span>
                        <span>{area.resolvedRate} resolved</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Metric Overview for Selected Area */}
        <div className="insight-overview">
          <div className="big-stat">
            <span className="stat-icon"><Users size={19} /></span>
            <strong>{currentArea.totalReports}</strong>
            <span>{t.insights.stat1Label}</span>
            <div className="trend">{trendText}</div>
          </div>

          <div className="big-stat yellow-stat">
            <span className="stat-icon"><Check size={19} /></span>
            <strong>{currentArea.resolvedRate}</strong>
            <span>{t.insights.stat2Label}</span>
            <div className="trend">{currentArea.resolvedCount} closed issues</div>
          </div>

          <div className="topics">
            <span className="muted-label">{t.insights.topicsLabel} — {areaName}</span>
            {topicList.map(({ label, val, color }) => (
              <div key={label}>
                <span>{label}</span>
                <b>{val}</b>
                <i><em style={{ width: val.replace(/[^0-9%]/g, '') || val, backgroundColor: color || '#78b58b' }} /></i>
              </div>
            ))}
          </div>

          {/* Official Ward Office & Helpline Banner */}
          <div className="ward-office-banner">
            <div className="ward-office-info">
              <div className="ward-office-icon">
                <Building2 size={22} />
              </div>
              <div className="ward-office-details">
                <b>{t.insights.wardOfficeLabel}: {areaName}</b>
                <small>{wardOfficeAddress}</small>
              </div>
            </div>
            <div className="ward-helpline-chip">
              <Phone size={15} />
              <span>{t.insights.helplineLabel}: {currentArea.helpline}</span>
            </div>
          </div>

          {/* Recent Hotspots & Citizen Action Section */}
          <div className="hotspots-section">
            <div className="hotspots-heading">
              <h3>{t.insights.hotspotsHeading}</h3>
              <span className="status-dot pulse" />
            </div>
            <div className="hotspots-grid">
              {currentArea.hotspots.map((item, idx) => {
                const loc = lang === 'hi' ? item.locationHi : lang === 'mr' ? item.locationMr : item.location;
                const issue = lang === 'hi' ? item.issueHi : lang === 'mr' ? item.issueMr : item.issue;
                const status = lang === 'hi' ? item.statusHi : lang === 'mr' ? item.statusMr : item.status;
                const isResolved = item.status === 'Resolved';
                return (
                  <div className="hotspot-card" key={idx}>
                    <div className="hotspot-header">
                      <span className={`hotspot-status ${isResolved ? 'resolved' : 'in-progress'}`}>
                        {isResolved ? <Check size={12} /> : <AlertCircle size={12} />}
                        {status}
                      </span>
                    </div>
                    <div className="hotspot-location">
                      <MapPin size={14} />
                      <span>{loc}</span>
                    </div>
                    <div className="hotspot-issue">{issue}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Map Visualizer with Quick Area Switching Pins */}
          <div className="interactive-map-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2 }}>
              <MapPin size={22} style={{ color: 'var(--forest)' }} />
              <div>
                <b style={{ color: 'var(--forest)', fontSize: '15px' }}>{t.insights.mapInteractive}</b>
                <small style={{ display: 'block', color: '#688072' }}>{t.insights.mapComingSoon}</small>
              </div>
            </div>
            <p style={{ margin: '14px 0 6px', fontSize: '12px', color: '#557262', zIndex: 2 }}>
              Click any Pune ward below to explore live civic issues:
            </p>
            <div className="map-pins-container">
              {puneAreas.map((area) => {
                const isSelected = area.id === selectedAreaId;
                const label = area.name[lang] || area.name.en;
                return (
                  <button
                    key={area.id}
                    type="button"
                    className={`map-ward-pin ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedAreaId(area.id)}
                  >
                    <MapPin size={13} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Official Source Attribution */}
          <div className="source-credit">
            <span>{t.insights.sourceNote}</span>
          </div>
        </div>
      </main>
    </>
  );
}


function App() {
  const [lang, setLang] = useState('en'); // Default selected language is English
  const [screen, setScreen] = useState('home');
  const [complaint, setComplaint] = useState(null);
  const [result, setResult] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState('idle');
  const [analysisError, setAnalysisError] = useState('');

  const t = translations[lang] || translations.en;

  const start = () => {
    setComplaint(null);
    setResult(null);
    setAnalysisError('');
    setAnalysisStatus('idle');
    setScreen('form');
  };
  const analyze = async (data) => {
    const request = {
      ...data,
      conversation: data.conversation?.length
        ? data.conversation
        : [{ role: 'user', content: data.text }],
    };
    setComplaint(request);
    setResult(null);
    setAnalysisError('');
    setAnalysisStatus('loading');
    setScreen('analysis');
    try {
      const response = request.image
        ? await analyzeComplaintImage(request, lang)
        : await analyzeComplaint(request, lang);
      setResult(response);
      setAnalysisStatus('success');
    } catch (error) {
      setAnalysisStatus('error');
      setAnalysisError(error instanceof Error ? error.message : 'The analysis service is unavailable. Please try again.');
    }
  };

  const answerFollowUp = (answer) => {
    if (!complaint || !result?.missingInformation?.length) return;
    const question = result.missingInformation[0];
    const nextComplaint = {
      ...complaint,
      text: `${complaint.text}\n\nAdditional information: ${answer}`,
      conversation: [
        ...(complaint.conversation || [{ role: 'user', content: complaint.text }]),
        { role: 'assistant', content: question },
        { role: 'user', content: answer },
      ],
    };
    analyze(nextComplaint);
  };

  return screen === 'home' ? (
    <Home onStart={start} onInsights={() => setScreen('insights')} lang={lang} setLang={setLang} t={t} />
  ) : screen === 'form' ? (
    <ComplaintForm onAnalyze={analyze} onBack={() => setScreen('home')} initialComplaint={complaint} lang={lang} setLang={setLang} t={t} />
  ) : screen === 'analysis' ? (
    <Analysis
      complaint={complaint}
      result={result}
      loading={analysisStatus === 'loading'}
      error={analysisStatus === 'error' ? analysisError : ''}
      onRetry={() => complaint && analyze(complaint)}
      onFollowUp={answerFollowUp}
      onReview={() => setScreen('review')}
      onBack={() => setScreen('form')}
      conversation={complaint?.conversation}
      lang={lang}
      setLang={setLang}
      t={t}
    />
  ) : screen === 'review' ? (
    <Review
      complaint={complaint}
      result={result}
      onBack={() => setScreen('analysis')}
      onDone={() => setScreen('home')}
      lang={lang}
      setLang={setLang}
      t={t}
    />
  ) : (
    <Insights onBack={() => setScreen('home')} lang={lang} setLang={setLang} t={t} />
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('PuneSahayak error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px 24px', maxWidth: '640px', margin: '60px auto', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #dce4dd', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}>
          <h2 style={{ color: '#174b35', fontFamily: 'Fraunces, serif', fontSize: '28px', margin: '0 0 12px' }}>Something went wrong</h2>
          <p style={{ color: '#6d7e75', margin: '0 0 24px', fontSize: '15px' }}>
            We encountered an unexpected error. You can refresh or return to the main page.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            Reload application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
if (!window.__puneSahayakRoot) {
  window.__puneSahayakRoot = createRoot(container);
}
window.__puneSahayakRoot.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
