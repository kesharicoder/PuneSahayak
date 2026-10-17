import { useState, useRef, useEffect } from 'react';
import {
  AlertCircle, ArrowLeft, ArrowRight, Bot, Building2, Check, ChevronDown, ClipboardList,
  Clock, Compass, FileText, Globe, MapPin, Menu, MessageCircle, Mic, Phone, Plus,
  Send, ShieldCheck, Sparkles, Users, X, Zap,
} from 'lucide-react';
import { analyzeComplaint } from './services/apiClient';
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

function Analysis({ complaint, result, loading, error, onReview, onRetry, onBack, lang, setLang, t }) {
  const waitingForResult = loading || (!result && !error);
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
              <MapPin size={16} /> {result?.location || complaint?.location || 'Location not provided'}
            </div>
            <button className="edit-button" onClick={onBack}>
              <ArrowLeft size={15} /> {t.analysis.editBtn}
            </button>
          </aside>
        </div>
        {result && <button id="review-report-button" className="primary-button continue-button review-button" onClick={onReview}>
          {t.analysis.reviewBtn} <ArrowRight size={18} />
        </button>}
      </main>
    </>
  );
}

function Review({ complaint, result, onBack, onDone, lang, setLang, t }) {
  const [shared, setShared] = useState(false);
  const recommendedAction = result.actions.length ? `${result.actions.join('. ')}.` : result.report;
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
              <span>{result.reference ? <>{t.review.successText}<strong>{result.reference}</strong>{t.review.successSub}</> : 'Your report is ready to share with PMC.'}</span>
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
    setResult(null);
    setAnalysisError('');
    setAnalysisStatus('idle');
    setScreen('form');
  };
  const analyze = async (data) => {
    setComplaint(data);
    setResult(null);
    setAnalysisError('');
    setAnalysisStatus('loading');
    setScreen('analysis');
    try {
      const response = await analyzeComplaint(data, lang);
      setResult(response);
      setAnalysisStatus('success');
    } catch (error) {
      setAnalysisStatus('error');
      setAnalysisError(error instanceof Error ? error.message : 'The analysis service is unavailable. Please try again.');
    }
  };

  return screen === 'home' ? (
    <Home onStart={start} onInsights={() => setScreen('insights')} lang={lang} setLang={setLang} t={t} />
  ) : screen === 'form' ? (
    <ComplaintForm onAnalyze={analyze} onBack={() => setScreen('home')} lang={lang} setLang={setLang} t={t} />
  ) : screen === 'analysis' ? (
    <Analysis
      complaint={complaint}
      result={result}
      loading={analysisStatus === 'loading'}
      error={analysisStatus === 'error' ? analysisError : ''}
      onRetry={() => complaint && analyze(complaint)}
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
const container = document.getElementById('root');
if (!window.__puneSahayakRoot) {
  window.__puneSahayakRoot = createRoot(container);
}
window.__puneSahayakRoot.render(<App />);
