import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Bot, Check, ChevronDown, ClipboardList, FileText,
  Globe, MapPin, Menu, MessageCircle, Mic, Plus, Send, ShieldCheck, Sparkles,
  Users, X, Zap,
} from 'lucide-react';
import { analyzeComplaint } from './services/apiClient';
import { languages, translations } from './i18n/translations';
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
      <div className="feature-icon">{icon}</div>
      <span className="feature-number">{number}</span>
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

function ComplaintForm({ onAnalyze, onBack, lang, setLang, t }) {
  const [text, setText] = useState('');
  const defaultLoc = lang === 'hi' || lang === 'mr' ? 'कोथरूड, पुणे' : 'Kothrud, Pune';
  const [location, setLocation] = useState(defaultLoc);
  const [category, setCategory] = useState('');
  const canContinue = text.trim().length > 10;

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
              onChange={(e) => setText(e.target.value)}
              placeholder={t.form.placeholder}
              maxLength={500}
            />
            <button className="mic-button" aria-label="Voice input">
              <Mic size={20} />
            </button>
            <span className="counter">{text.length}/500</span>
          </div>
          <div className="examples">
            <span>{t.form.tryExample}</span>
            {t.form.examples.map((example) => (
              <button key={example} type="button" onClick={() => setText(example)}>
                {example.slice(0, 34)}…
              </button>
            ))}
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="location"><MapPin size={16} /> {t.form.labelLocation}</label>
              <div className="input-with-icon">
                <MapPin size={17} />
                <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="category">
                {t.form.labelCategory}
              </label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">{t.form.selectCategory}</option>
                <option value={t.form.catRoads}>{t.form.catRoads}</option>
                <option value={t.form.catWaste}>{t.form.catWaste}</option>
                <option value={t.form.catWater}>{t.form.catWater}</option>
                <option value={t.form.catLights}>{t.form.catLights}</option>
                <option value={t.form.catTraffic}>{t.form.catTraffic}</option>
                <option value={t.form.catDrainage}>{t.form.catDrainage}</option>
              </select>
            </div>
          </div>
          <button
            id="submit-analysis-button"
            className="primary-button continue-button"
            disabled={!canContinue}
            onClick={() => onAnalyze({ text, location, category })}
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

function Analysis({ complaint, result, onReview, onBack, lang, setLang, t }) {
  return (
    <>
      <Header onHome={onBack} compact lang={lang} setLang={setLang} t={t} />
      <main className="flow-shell">
        <Stepper step={1} t={t} />
        <div className="flow-heading">
          <span className="eyebrow">{t.analysis.stepLabel}</span>
          <h1>{t.analysis.heading}</h1>
          <p>{t.analysis.subheading}</p>
        </div>
        <div className="analysis-grid">
          <div className="analysis-main">
            <div className="loading-badge">
              <span className="spinner" /> {t.analysis.analyzingBadge}
            </div>
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
              {result.actions.map((action, i) => (
                <div className="action-item" key={action}>
                  <span>{i + 1}</span>
                  {action}
                  <Check size={17} />
                </div>
              ))}
            </div>
          </div>
          <aside className="detail-card">
            <span className="muted-label">{t.analysis.routeToLabel}</span>
            <div className="department">
              <div className="department-icon"><Users size={20} /></div>
              <div>
                <b>{result.department}</b>
                <small>{t.analysis.pmcSub}</small>
              </div>
            </div>
            <div className="detail-location">
              <MapPin size={16} /> {result.location}
            </div>
            <button className="edit-button" onClick={onBack}>
              <ArrowLeft size={15} /> {t.analysis.editBtn}
            </button>
          </aside>
        </div>
        <button id="review-report-button" className="primary-button continue-button review-button" onClick={onReview}>
          {t.analysis.reviewBtn} <ArrowRight size={18} />
        </button>
      </main>
    </>
  );
}

function Review({ complaint, result, onBack, onDone, lang, setLang, t }) {
  const [shared, setShared] = useState(false);
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
          <div className="report-body">
            <span className="muted-label">{t.review.recommendedActionLabel}</span>
            <p>{result.actions.join('. ')}.</p>
          </div>
        </div>
        <div className="review-actions">
          <button className="outline-button" onClick={onBack}>
            <ArrowLeft size={17} /> {t.review.makeEditsBtn}
          </button>
          <button id="share-report-button" className="primary-button" onClick={() => setShared(true)}>
            {shared ? (
              <><Check size={17} /> {t.review.sharedBtn}</>
            ) : (
              <><Send size={17} /> {t.review.shareBtn}</>
            )}
          </button>
        </div>
        {shared && (
          <div className="success-message">
            <Check size={19} />
            <div>
              <b>{t.review.successHeading}</b>
              <span>{t.review.successText}<strong>{result.reference}</strong>{t.review.successSub}</span>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function Insights({ onBack, lang, setLang, t }) {
  return (
    <>
      <Header onHome={onBack} lang={lang} setLang={setLang} t={t} />
      <main className="insights-page">
        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={16} /> {t.insights.backBtn}
        </button>
        <div className="flow-heading">
          <span className="eyebrow">{t.insights.eyebrow}</span>
          <h1>{t.insights.heading}</h1>
          <p>{t.insights.subheading}</p>
        </div>
        <div className="insight-overview">
          <div className="big-stat">
            <span className="stat-icon"><Users size={19} /></span>
            <strong>1,284</strong>
            <span>{t.insights.stat1Label}</span>
            <div className="trend">{t.insights.stat1Trend}</div>
          </div>
          <div className="big-stat yellow-stat">
            <span className="stat-icon"><Check size={19} /></span>
            <strong>73%</strong>
            <span>{t.insights.stat2Label}</span>
            <div className="trend">{t.insights.stat2Trend}</div>
          </div>
          <div className="topics">
            <span className="muted-label">{t.insights.topicsLabel}</span>
            {t.insights.topics.map(({ label, val }) => (
              <div key={label}>
                <span>{label}</span>
                <b>{val}</b>
                <i><em style={{ width: val.replace(/[^0-9%]/g, '') || val }} /></i>
              </div>
            ))}
          </div>
        </div>
        <div className="neighbourhood-card">
          <div>
            <span className="eyebrow">{t.insights.watchEyebrow}</span>
            <h2>{t.insights.watchHeading}</h2>
            <p>{t.insights.watchSub}</p>
          </div>
          <button className="outline-button">
            {t.insights.changeAreaBtn} <ChevronDown size={15} />
          </button>
          <div className="map-placeholder">
            <MapPin size={31} />
            <span>{t.insights.mapInteractive}</span>
            <small>{t.insights.mapComingSoon}</small>
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

  const t = translations[lang] || translations.en;

  const start = () => setScreen('form');
  const analyze = async (data) => {
    setComplaint(data);
    setScreen('analysis');
    const response = await analyzeComplaint(data, lang);
    setResult(response);
  };

  return screen === 'home' ? (
    <Home onStart={start} onInsights={() => setScreen('insights')} lang={lang} setLang={setLang} t={t} />
  ) : screen === 'form' ? (
    <ComplaintForm onAnalyze={analyze} onBack={() => setScreen('home')} lang={lang} setLang={setLang} t={t} />
  ) : screen === 'analysis' ? (
    <Analysis
      complaint={complaint}
      result={
        result || {
          summary:
            lang === 'hi'
              ? 'आपकी रिपोर्ट का विश्लेषण हो रहा है…'
              : lang === 'mr'
              ? 'आपल्या अहवालाचे वाचन सुरू आहे…'
              : 'Reading your report…',
          category:
            lang === 'hi' ? 'नागरिक समस्या' : lang === 'mr' ? 'नागरी समस्या' : 'Civic issue',
          urgency: lang === 'hi' ? 'मध्यम' : lang === 'mr' ? 'मध्यम' : 'Medium',
          location: complaint?.location,
          actions:
            lang === 'hi'
              ? ['उचित विभाग की खोज', 'समस्या की प्राथमिकता का निर्धारण', 'सुझावों की तैयारी']
              : lang === 'mr'
              ? ['योग्य विभाग शोधत आहोत', 'समस्येची निकड तपासत आहोत', 'शिफारसी तयार करत आहोत']
              : ['Finding the right department', 'Checking issue urgency', 'Preparing recommendations'],
          department:
            lang === 'hi' || lang === 'mr' ? 'पुणे महानगरपालिका (PMC)' : 'Pune Municipal Corporation',
        }
      }
      onReview={() => setScreen('review')}
      onBack={() => setScreen('form')}
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

import { createRoot } from 'react-dom/client';
createRoot(document.getElementById('root')).render(<App />);
