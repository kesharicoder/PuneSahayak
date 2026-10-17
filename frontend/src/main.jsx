import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft, ArrowRight, Bot, Check, ChevronDown, ClipboardList, Copy,
  Download, Edit3, Eye, FileDown, FileText, MapPin, Menu, MessageCircle,
  Mic, MicOff, Plus, Printer, Send, Share2, ShieldCheck, Sparkles,
  Users, X, Zap, AlertTriangle, AlertCircle
} from 'lucide-react';

import { Header } from './components/Header';
import { Stepper } from './components/Stepper';
import { ImageUploader } from './components/ImageUploader';
import { InteractiveMap } from './components/InteractiveMap';
import { EditReportModal } from './components/EditReportModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { analyzeComplaint } from './services/mockAnalysis';
import './styles.css';

const sampleComplaints = [
  {
    tag: 'Hinglish',
    text: 'Kothrud mein signal ke paas bada pothole hai. Raat ko dikhta nahi, please fix kara do.',
    location: 'Kothrud, Pune',
    category: 'Roads & footpaths'
  },
  {
    tag: 'मराठी',
    text: 'वार्ड १२ मध्ये कचरा ३ दिवसांपासून उचललेला नाही. दुर्गंधी सुटली आहे, त्वरित गाडी पाठवा.',
    location: 'Swargate, Pune',
    category: 'Waste management'
  },
  {
    tag: 'English',
    text: 'Streetlights near modern cafe are completely dark for past two nights, causing pedestrian safety issues.',
    location: 'Shivajinagar, Pune',
    category: 'Street lights'
  },
  {
    tag: 'Hinglish',
    text: 'Baner road pe low water pressure aa raha hai pichhle 2 din se.',
    location: 'Baner, Pune',
    category: 'Water supply'
  }
];

function Home({ onStart, onInsights, currentLanguage, onLanguageChange }) {
  return (
    <>
      <Header
        onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onInsights={onInsights}
        onStartReport={onStart}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />
      <main className="home-shell">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="pulse" />
              <span>BUILT FOR PUNE, BY PUNEKARS</span>
            </div>
            <h1>
              Your city.<br />
              <em>Your voice.</em><br />
              Your <span className="underlined">sahayak.</span>
            </h1>
            <p className="hero-lead">
              Turn everyday civic issues into action. Describe what’s wrong in Marathi, Hindi, or English,
              and Gemma 4 will help you make it count.
            </p>
            <div className="hero-actions">
              <button className="primary-button hero-cta-btn" onClick={onStart}>
                Report an issue <ArrowRight size={18} />
              </button>
              <button className="text-button hero-sub-btn" onClick={onInsights}>
                See community insights <ArrowRight size={16} />
              </button>
            </div>
            <div className="trust-line">
              <ShieldCheck size={18} />
              <span>Private by default</span>
              <span className="separator">·</span>
              <span>Marathi, Hindi & English</span>
              <span className="separator">·</span>
              <span>Powered by Gemma 4</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Illustration of Pune civic life">
            <div className="sun" />
            <div className="hill hill-one" />
            <div className="hill hill-two" />
            <div className="tree tree-one">✦</div>
            <div className="tree tree-two">✦</div>
            <div className="road">
              <span /><span /><span />
            </div>
            <div className="illustration-card">
              <MapPin size={16} />
              <b>Kothrud, Pune</b>
              <small>2 issues nearby · Gemma ready</small>
            </div>
          </div>
        </section>

        <section className="home-lower" id="how">
          <div className="section-intro">
            <span className="eyebrow">SIMPLE BY DESIGN</span>
            <h2>
              From “kuch toh karna padega”<br />
              to <em>“kaam ho gaya.”</em>
            </h2>
          </div>
          <div className="feature-grid">
            <Feature
              icon={<MessageCircle />}
              number="01"
              title="Describe"
              text="Tell us what’s happening in your own words. Marathi, Hindi, Hinglish — all welcome. Attach a photo if available."
            />
            <Feature
              icon={<Sparkles />}
              number="02"
              title="Analyze"
              text="Gemma 4 finds the right PMC department, urgency rating, missing details, and structured action steps."
            />
            <Feature
              icon={<ClipboardList />}
              number="03"
              title="Review"
              text="You stay in full control. Check bilingual reports, edit any field, and export official printable dossiers."
            />
          </div>
        </section>

        <section className="insight-tease" id="insights">
          <div className="insight-tease-content">
            <span className="eyebrow">PUNE, TOGETHER</span>
            <h2>Small reports.<br /><em>Big patterns.</em></h2>
            <p>See what your neighbourhood is talking about and add your voice to PMC civic priorities.</p>
          </div>
          <div className="mini-stats">
            <div>
              <strong>1,284</strong>
              <span>issues reported</span>
            </div>
            <div>
              <strong>73%</strong>
              <span>resolved this month</span>
            </div>
          </div>
          <button className="dark-button" onClick={onInsights}>
            Explore insights <ArrowRight size={17} />
          </button>
        </section>
      </main>

      <footer>
        <div className="footer-content">
          <span>© PuneSahayak 2026 · Multilingual Civic Assistant</span>
          <span>Made with care in Pune <span className="heart">♥</span> for PMC Citizens</span>
        </div>
      </footer>
    </>
  );
}

function Feature({ icon, number, title, text }) {
  return (
    <div className="feature">
      <div className="feature-top">
        <div className="feature-icon">{icon}</div>
        <span className="feature-number">{number}</span>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function ComplaintForm({ onAnalyze, onBack, currentLanguage, onLanguageChange }) {
  const [text, setText] = useState('');
  const [location, setLocation] = useState('Kothrud, Pune');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const canContinue = text.trim().length >= 10;

  const handleVoiceToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate voice input placeholder if empty
      setTimeout(() => {
        if (!text) {
          setText('FC Road var signal javal rasta kharab jhala ahe, traffic jam hot ahe.');
        }
        setIsRecording(false);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleSelectExample = (ex) => {
    setText(ex.text);
    if (ex.location) setLocation(ex.location);
    if (ex.category) setCategory(ex.category);
  };

  return (
    <>
      <Header
        onHome={onBack}
        compact
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />
      <main className="flow-shell">
        <Stepper step={0} />

        <div className="flow-heading">
          <span className="eyebrow">STEP 01 / 03</span>
          <h1>What’s happening?</h1>
          <p>
            Describe the civic issue in your own words.
            <b> Marathi, Hindi, Hinglish — sagla chalta.</b>
          </p>
        </div>

        <div className="form-card">
          <div className="form-field-group">
            <label htmlFor="complaint" className="field-label-main">
              <span>Your civic issue</span>
              <span className="char-count">{text.length}/500</span>
            </label>

            <div className="textarea-wrap">
              <textarea
                id="complaint"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Kothrud mein signal ke paas bada pothole hai, ya ward 12 madhe kachra jamla ahe..."
                maxLength={500}
                rows={5}
                aria-describedby="char-limit-hint"
              />
              <button
                type="button"
                className={`mic-button ${isRecording ? 'recording' : ''}`}
                onClick={handleVoiceToggle}
                aria-label={isRecording ? 'Stop listening' : 'Use voice input'}
                title={isRecording ? 'Recording in progress...' : 'Click to dictate (Marathi/Hindi/English)'}
              >
                {isRecording ? <MicOff size={19} /> : <Mic size={19} />}
              </button>
            </div>

            {isRecording && (
              <div className="voice-listening-banner" role="status">
                <span className="pulse" />
                <span>Listening to your voice... (बोलत राहा, ऐकत आहोत...)</span>
              </div>
            )}
          </div>

          {/* Sample quick prompts */}
          <div className="examples-container">
            <span className="examples-label">Try an example:</span>
            <div className="examples-chips">
              {sampleComplaints.map((ex, i) => (
                <button
                  type="button"
                  key={i}
                  className="example-chip"
                  onClick={() => handleSelectExample(ex)}
                >
                  <span className="chip-lang-badge">{ex.tag}</span>
                  <span className="chip-text">{ex.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Image Uploader */}
          <div className="form-field-group">
            <label className="field-label-main">
              <span>Photo of the issue</span>
              <span className="optional">(optional but helps Gemma verify)</span>
            </label>
            <ImageUploader image={image} onImageChange={setImage} />
          </div>

          {/* Location and Category */}
          <div className="form-row-responsive">
            <div className="form-field-group">
              <div className="field-label-row">
                <label htmlFor="location">
                  <MapPin size={15} /> Where is it?
                </label>
                <button
                  type="button"
                  className="map-toggle-link"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                >
                  {showMapPicker ? 'Hide map' : 'Choose on map'}
                </button>
              </div>
              <div className="input-with-icon">
                <MapPin size={17} className="input-icon" />
                <input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kothrud, Pune"
                />
              </div>
            </div>

            <div className="form-field-group">
              <label htmlFor="category">
                Category <span className="optional">(Gemma can auto-detect)</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Auto-detect with Gemma 4</option>
                <option>Roads & footpaths</option>
                <option>Waste management</option>
                <option>Water supply & drainage</option>
                <option>Street lights</option>
                <option>Traffic & signals</option>
              </select>
            </div>
          </div>

          {/* Collapsible Interactive Location Picker Map */}
          {showMapPicker && (
            <div className="form-map-picker-container">
              <InteractiveMap
                selectedLocation={location}
                onSelectLocation={(newLoc) => {
                  setLocation(newLoc);
                  setShowMapPicker(false);
                }}
                isPicker
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="form-action-container">
            <button
              type="button"
              className="primary-button continue-button"
              disabled={!canContinue}
              onClick={() => onAnalyze({ text, location, category, image })}
            >
              Analyze my issue with Gemma 4 <ArrowRight size={18} />
            </button>
            {!canContinue && (
              <small className="char-helper-hint">
                Please enter at least 10 characters to analyze.
              </small>
            )}
          </div>
        </div>

        <p className="privacy-note">
          <ShieldCheck size={15} />
          <span>Your report is 100% private until you choose to review and submit it.</span>
        </p>
      </main>
    </>
  );
}

function Analysis({ complaint, result, onReview, onBack, currentLanguage, onLanguageChange }) {
  return (
    <>
      <Header
        onHome={onBack}
        compact
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />
      <main className="flow-shell">
        <Stepper step={1} />

        <div className="flow-heading">
          <span className="eyebrow">STEP 02 / 03</span>
          <h1>Here’s what we found.</h1>
          <p>Gemma 4 analyzed your report, categorized urgency, and mapped the PMC department.</p>
        </div>

        <div className="analysis-grid">
          <div className="analysis-main">
            <div className="loading-badge">
              <span className="spinner" />
              <span>POWERED BY GEMMA 4 · LOCAL REASONING COMPLETE</span>
            </div>

            <div className="analysis-card">
              <div className="analysis-card-top">
                <div className="spark-icon">
                  <Sparkles size={20} />
                </div>
                <div className="analysis-summary-block">
                  <span className="muted-label">AI ISSUE SUMMARY</span>
                  <h2>{result.summary}</h2>
                  {result.summaryMr && (
                    <p className="marathi-summary-preview marathi-font">
                      {result.summaryMr}
                    </p>
                  )}
                </div>
              </div>

              <div className="tag-row">
                <span className="tag green">
                  <ClipboardList size={14} /> {result.category}
                </span>
                <span className={`tag urgency-${(result.urgency || '').toLowerCase()}`}>
                  <Zap size={14} /> {result.urgency} urgency
                </span>
                <span className="tag blue">
                  <ShieldCheck size={14} /> Verified Schema
                </span>
              </div>
            </div>

            {/* Suggested Next Steps */}
            <div className="action-list-card">
              <h3>Recommended PMC Action Protocol</h3>
              <div className="action-items-wrap">
                {result.actions.map((action, i) => (
                  <div className="action-item" key={i}>
                    <span className="action-num">{i + 1}</span>
                    <span className="action-text">{action}</span>
                    <Check size={17} className="action-check" />
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Info Notification (PRD FR-07) */}
            {result.missingInfo && result.missingInfo.length > 0 && (
              <div className="missing-info-banner">
                <div className="missing-info-icon">
                  <AlertCircle size={18} />
                </div>
                <div className="missing-info-content">
                  <b>Information to consider adding:</b>
                  <ul>
                    {result.missingInfo.map((info, idx) => (
                      <li key={idx}>{info}</li>
                    ))}
                  </ul>
                  <small>You can edit and add these details in the next step.</small>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Aside Detail Card */}
          <aside className="detail-card">
            <span className="muted-label">ROUTING DESTINATION</span>

            <div className="department">
              <div className="department-icon">
                <Users size={20} />
              </div>
              <div className="department-info">
                <b>{result.department}</b>
                <small>Pune Municipal Corporation (PMC)</small>
              </div>
            </div>

            <div className="detail-location">
              <MapPin size={16} />
              <span>{result.location}</span>
            </div>

            {complaint?.image && (
              <div className="detail-attached-image">
                <span className="muted-label">ATTACHED PHOTO</span>
                <div className="aside-thumb-frame">
                  <img src={complaint.image.dataUrl} alt="Attached photo" />
                </div>
              </div>
            )}

            <button type="button" className="edit-button" onClick={onBack}>
              <ArrowLeft size={15} /> Modify description
            </button>
          </aside>
        </div>

        <div className="analysis-actions-row">
          <button type="button" className="outline-button back-flow-btn" onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </button>
          <button type="button" className="primary-button continue-button review-button" onClick={onReview}>
            Review & generate report <ArrowRight size={18} />
          </button>
        </div>
      </main>
    </>
  );
}

function Review({
  complaint,
  result,
  onUpdateResult,
  onBack,
  onDone,
  currentLanguage,
  onLanguageChange
}) {
  const [bilingualTab, setBilingualTab] = useState('both'); // 'en' | 'mr' | 'both'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyReport = () => {
    const textToCopy = `PUNESAHAYAK CIVIC REPORT (${result.reference})
Locality: ${result.location}
Category: ${result.category}
Assigned: ${result.department}
Urgency: ${result.urgency}

Summary:
${result.summary}

सारांश (मराठी):
${result.summaryMr || ''}

Actions:
${(result.actions || []).map((a, i) => `${i + 1}. ${a}`).join('\n')}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleShare = async () => {
    setShared(true);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `PuneSahayak Civic Grievance ${result.reference}`,
          text: `Civic report for ${result.location}: ${result.summary}. Reference: ${result.reference}`,
          url: window.location.href,
        });
      } catch (err) {
        // Ignored or dismissed
      }
    }
  };

  return (
    <>
      <Header
        onHome={onBack}
        compact
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />
      <main className="flow-shell">
        <Stepper step={2} />

        <div className="flow-heading">
          <span className="eyebrow">STEP 03 / 03</span>
          <h1>Make it count.</h1>
          <p>Review and finalize your bilingual report before submission to PMC.</p>
        </div>

        {/* The Formal Report Card */}
        <div className="report-card">
          <div className="report-head">
            <div className="report-logo">पु</div>
            <div className="report-title-meta">
              <span className="muted-label">PUNESAHAYAK CIVIC REPORT</span>
              <h2>{result.category} in {result.location.split(',')[0]}</h2>
            </div>
            <div className="report-header-badges">
              <span className="draft-pill">VERIFIED DRAFT</span>
              <span className="ref-pill">{result.reference}</span>
            </div>
          </div>

          <div className="report-meta">
            <span>
              <MapPin size={15} /> {result.location}
            </span>
            <span>
              <ClipboardList size={15} /> {result.category}
            </span>
            <span>
              <Zap size={15} /> {result.urgency} urgency
            </span>
            <span>
              <Users size={15} /> {result.department}
            </span>
          </div>

          {/* Bilingual View Selector */}
          <div className="bilingual-toggle-row">
            <span className="toggle-label">Report Language:</span>
            <div className="pill-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={bilingualTab === 'both'}
                className={`pill-tab ${bilingualTab === 'both' ? 'active' : ''}`}
                onClick={() => setBilingualTab('both')}
              >
                Bilingual (Both)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={bilingualTab === 'en'}
                className={`pill-tab ${bilingualTab === 'en' ? 'active' : ''}`}
                onClick={() => setBilingualTab('en')}
              >
                English
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={bilingualTab === 'mr'}
                className={`pill-tab ${bilingualTab === 'mr' ? 'active' : ''}`}
                onClick={() => setBilingualTab('mr')}
              >
                मराठी (Marathi)
              </button>
            </div>
          </div>

          {/* Citizen Original Statement */}
          <div className="report-body">
            <span className="muted-label">ORIGINAL CITIZEN STATEMENT</span>
            <p className="complaint-quote">“{complaint?.text}”</p>
          </div>

          {/* Attached Photo Preview if available */}
          {complaint?.image && (
            <div className="report-body">
              <span className="muted-label">ATTACHED PHOTOGRAPHIC EVIDENCE</span>
              <div className="report-attached-photo-frame">
                <img
                  src={complaint.image.dataUrl}
                  alt="Evidence uploaded by citizen"
                  className="report-attached-img"
                />
              </div>
            </div>
          )}

          {/* Report Summaries according to Bilingual tab */}
          {(bilingualTab === 'en' || bilingualTab === 'both') && (
            <div className="report-body">
              <span className="muted-label">OFFICIAL SUMMARY (ENGLISH)</span>
              <p>{result.summary}</p>
            </div>
          )}

          {(bilingualTab === 'mr' || bilingualTab === 'both') && result.summaryMr && (
            <div className="report-body">
              <span className="muted-label">अधिकृत सारांश (मराठी)</span>
              <p className="marathi-font">{result.summaryMr}</p>
            </div>
          )}

          {/* Recommended Municipal Actions */}
          <div className="report-body">
            <span className="muted-label">RECOMMENDED PMC ACTION PROTOCOL</span>
            <ol className="report-action-ol">
              {(result.actions || []).map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* Responsive Review Action Bar */}
        <div className="review-actions-container">
          <div className="secondary-action-group">
            <button
              type="button"
              className="outline-button"
              onClick={() => setIsEditModalOpen(true)}
              aria-label="Edit report details"
            >
              <Edit3 size={16} /> Edit details
            </button>

            <button
              type="button"
              className="outline-button"
              onClick={handleCopyReport}
              aria-label="Copy report text"
            >
              {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy text</>}
            </button>

            <button
              type="button"
              className="outline-button"
              onClick={() => setIsPdfModalOpen(true)}
              aria-label="Preview official A4 report"
            >
              <FileDown size={16} /> Preview & Print PDF
            </button>
          </div>

          <div className="primary-action-group">
            <button
              type="button"
              className="outline-button back-to-analysis-btn"
              onClick={onBack}
            >
              <ArrowLeft size={16} /> Back
            </button>

            <button
              type="button"
              className="primary-button submit-share-btn"
              onClick={handleShare}
            >
              {shared ? (
                <>
                  <Check size={18} /> Report Ready ({result.reference})
                </>
              ) : (
                <>
                  <Send size={18} /> Generate & share report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Confirmation Card */}
        {shared && (
          <div className="success-message" role="status">
            <div className="success-icon-wrap">
              <Check size={20} />
            </div>
            <div className="success-content">
              <b>Civic Grievance Dossier Generated!</b>
              <span>
                Your reference number is <strong>{result.reference}</strong>.
                You can now export the official PDF, copy the text to PuneConnect or PMC WhatsApp helpline,
                or share it with your ward office.
              </span>
              <div className="success-subactions">
                <button
                  type="button"
                  className="primary-button small-button"
                  onClick={() => setIsPdfModalOpen(true)}
                >
                  <Printer size={15} /> Print / Save Official PDF
                </button>
                <button
                  type="button"
                  className="outline-button small-button"
                  onClick={onDone}
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Report Modal */}
        <EditReportModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          result={result}
          onSave={(updatedData) => {
            onUpdateResult({
              ...result,
              ...updatedData
            });
          }}
        />

        {/* PDF Preview Modal */}
        <PdfPreviewModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          complaint={complaint}
          result={result}
        />
      </main>
    </>
  );
}

function Insights({ onBack, onStartReport, currentLanguage, onLanguageChange }) {
  const [selectedWard, setSelectedWard] = useState('Kothrud, Pune');

  return (
    <>
      <Header
        onHome={onBack}
        onStartReport={onStartReport}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />
      <main className="insights-page">
        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={16} /> Back to home
        </button>

        <div className="flow-heading insights-header">
          <span className="eyebrow">COMMUNITY PULSE</span>
          <h1>What Pune is saying.</h1>
          <p>Real-time civic trends from fellow Punekars across all 15 municipal wards.</p>
        </div>

        {/* Big Stats Grid */}
        <div className="insight-overview">
          <div className="big-stat">
            <span className="stat-icon">
              <Users size={19} />
            </span>
            <strong>1,284</strong>
            <span>issues reported</span>
            <div className="trend">↑ 18% from last month</div>
          </div>

          <div className="big-stat yellow-stat">
            <span className="stat-icon">
              <Check size={19} />
            </span>
            <strong>73%</strong>
            <span>resolved or in progress</span>
            <div className="trend">↑ 9% from last month</div>
          </div>

          <div className="topics">
            <span className="muted-label">TOP CIVIC DOMAINS</span>
            {[
              ['Roads & footpaths', '42%'],
              ['Waste management', '28%'],
              ['Water & drainage', '18%'],
              ['Street lights', '12%']
            ].map(([label, val]) => (
              <div key={label} className="topic-bar-row">
                <div className="topic-bar-labels">
                  <span>{label}</span>
                  <b>{val}</b>
                </div>
                <i>
                  <em style={{ width: val }} />
                </i>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Ward Map Section */}
        <div className="neighbourhood-card">
          <div className="neighbourhood-card-top">
            <div>
              <span className="eyebrow">NEIGHBOURHOOD WATCH</span>
              <h2>Interactive Pune Ward Map</h2>
              <p>Explore live civic reports and resolution rates by locality.</p>
            </div>
          </div>

          <div className="interactive-map-embed">
            <InteractiveMap
              selectedLocation={selectedWard}
              onSelectLocation={(loc) => setSelectedWard(loc)}
            />
          </div>
        </div>

        <div className="insights-cta-box">
          <h3>Notice a civic issue in your area?</h3>
          <p>Don’t wait. File a structured report in Marathi, Hindi, or English in under a minute.</p>
          <button className="primary-button" onClick={onStartReport}>
            Report an issue now <ArrowRight size={17} />
          </button>
        </div>
      </main>
    </>
  );
}

function App() {
  const [screen, setScreen] = useState('home');
  const [complaint, setComplaint] = useState(null);
  const [result, setResult] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('mr');

  const start = () => setScreen('form');

  const analyze = async (data) => {
    setComplaint(data);
    setScreen('analysis');
    const response = await analyzeComplaint(data);
    setResult(response);
  };

  const handleUpdateResult = (newResult) => {
    setResult(newResult);
  };

  return (
    <div className="app-root">
      {screen === 'home' && (
        <Home
          onStart={start}
          onInsights={() => setScreen('insights')}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />
      )}

      {screen === 'form' && (
        <ComplaintForm
          onAnalyze={analyze}
          onBack={() => setScreen('home')}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />
      )}

      {screen === 'analysis' && (
        <Analysis
          complaint={complaint}
          result={
            result || {
              summary: 'Gemma 4 is reading your report and detecting civic details…',
              summaryMr: 'जेम्मा ४ मॉडेल आपल्या तक्रारीचे विश्लेषण करत आहे…',
              category: complaint?.category || 'Roads & footpaths',
              urgency: 'Medium',
              location: complaint?.location || 'Kothrud, Pune',
              actions: [
                'Identifying municipal jurisdiction',
                'Checking severity and safety impact',
                'Formulating bilingual resolution protocol'
              ],
              department: 'Road Department, PMC',
              missingInfo: []
            }
          }
          onReview={() => setScreen('review')}
          onBack={() => setScreen('form')}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />
      )}

      {screen === 'review' && (
        <Review
          complaint={complaint}
          result={result}
          onUpdateResult={handleUpdateResult}
          onBack={() => setScreen('analysis')}
          onDone={() => setScreen('home')}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />
      )}

      {screen === 'insights' && (
        <Insights
          onBack={() => setScreen('home')}
          onStartReport={start}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
