import { useState } from 'react';
import {
  ArrowLeft, ArrowRight, Bot, Check, ChevronDown, ClipboardList, FileText,
  MapPin, Menu, MessageCircle, Mic, Plus, Send, ShieldCheck, Sparkles,
  Users, X, Zap,
} from 'lucide-react';
import { analyzeComplaint } from './services/mockAnalysis';
import './styles.css';

const examples = [
  'Kothrud mein signal ke paas bada pothole hai. Raat ko dikhta nahi, please fix kara do.',
  'Ward 12 madhe kachra 3 divasapasun uchalalela nahi.',
];

function Header({ onHome, compact = false }) {
  return <header className="topbar">
    <button className="brand" onClick={onHome} aria-label="Go to PuneSahayak home">
      <span className="brand-mark">पु</span><span>Pune<span className="brand-accent">Sahayak</span></span>
    </button>
    <nav className={compact ? 'desktop-only' : ''} aria-label="Primary navigation">
      <a href="#how">How it works</a><a href="#insights">Community insights</a>
    </nav>
    <button className="outline-button small-button"><span className="status-dot" /> Marathi <ChevronDown size={15} /></button>
    <button className="menu-button" aria-label="Open menu"><Menu size={21} /></button>
  </header>;
}

function Stepper({ step }) {
  const steps = [['01', 'Describe'], ['02', 'Analyze'], ['03', 'Review']];
  return <div className="stepper" aria-label="Complaint progress">
    {steps.map(([number, label], index) => <div className={`step ${step >= index ? 'active' : ''}`} key={label}>
      <span>{step > index ? <Check size={15} /> : number}</span><b>{label}</b>{index < 2 && <i />}
    </div>)}
  </div>;
}

function Home({ onStart, onInsights }) {
  return <><Header onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
    <main className="home-shell">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> BUILT FOR PUNE, BY PUNEKARS</div>
          <h1>Your city.<br /><em>Your voice.</em><br />Your <span className="underlined">sahayak.</span></h1>
          <p className="hero-lead">Turn everyday civic issues into action. Describe what’s wrong, and we’ll help you make it count.</p>
          <div className="hero-actions"><button className="primary-button" onClick={onStart}>Report an issue <ArrowRight size={18} /></button><button className="text-button" onClick={onInsights}>See community insights <ArrowRight size={16} /></button></div>
          <div className="trust-line"><ShieldCheck size={18} /> <span>Private by default</span><span className="separator">·</span><span>Available in Marathi & English</span></div>
        </div>
        <div className="hero-art" aria-label="Illustration of Pune civic life">
          <div className="sun" /><div className="hill hill-one" /><div className="hill hill-two" /><div className="tree tree-one">✦</div><div className="tree tree-two">✦</div>
          <div className="road"><span /><span /><span /></div><div className="illustration-card"><MapPin size={16} /><b>Kothrud, Pune</b><small>2 issues nearby</small></div>
        </div>
      </section>
      <section className="home-lower" id="how"><div className="section-intro"><span className="eyebrow">SIMPLE BY DESIGN</span><h2>From “kuch toh karna padega”<br />to <em>“kaam ho gaya.”</em></h2></div>
        <div className="feature-grid"><Feature icon={<MessageCircle />} number="01" title="Describe" text="Tell us what’s happening in your own words. Marathi, Hindi, Hinglish — all welcome." /><Feature icon={<Sparkles />} number="02" title="Analyze" text="Our AI finds the right department, urgency and next best action." /><Feature icon={<ClipboardList />} number="03" title="Review" text="You stay in control. Check, edit and generate a clear civic report." /></div>
      </section>
      <section className="insight-tease" id="insights"><div><span className="eyebrow">PUNE, TOGETHER</span><h2>Small reports.<br /><em>Big patterns.</em></h2><p>See what your neighbourhood is talking about and add your voice.</p></div><div className="mini-stats"><div><strong>1,284</strong><span>issues reported</span></div><div><strong>73%</strong><span>resolved this month</span></div></div><button className="dark-button" onClick={onInsights}>Explore insights <ArrowRight size={17} /></button></section>
    </main><footer><span>© PuneSahayak 2024</span><span>Made with care in Pune <span className="heart">♥</span></span></footer>
  </>;
}

function Feature({ icon, number, title, text }) { return <div className="feature"><div className="feature-icon">{icon}</div><span className="feature-number">{number}</span><h3>{title}</h3><p>{text}</p></div>; }

function ComplaintForm({ onAnalyze, onBack }) {
  const [text, setText] = useState(''); const [location, setLocation] = useState('Kothrud, Pune'); const [category, setCategory] = useState('');
  const canContinue = text.trim().length > 10;
  return <><Header onHome={onBack} compact /><main className="flow-shell"><Stepper step={0} /><div className="flow-heading"><span className="eyebrow">STEP 01 / 03</span><h1>What’s happening?</h1><p>Describe the issue in your own words. <b>Marathi, Hindi, Hinglish — sagla chalta.</b></p></div><div className="form-card"><label htmlFor="complaint">Your civic issue</label><div className="textarea-wrap"><textarea id="complaint" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Kothrud mein footpath pe bahut kachra jama hai..." maxLength={500} /><button className="mic-button" aria-label="Use voice input"><Mic size={20} /></button><span className="counter">{text.length}/500</span></div><div className="examples"><span>Try an example</span>{examples.map((example) => <button key={example} onClick={() => setText(example)}>{example.slice(0, 34)}…</button>)}</div><div className="form-row"><div><label htmlFor="location"><MapPin size={16} /> Where is it?</label><div className="input-with-icon"><MapPin size={17} /><input id="location" value={location} onChange={(e) => setLocation(e.target.value)} /></div></div><div><label htmlFor="category">Category <span className="optional">(optional)</span></label><select id="category" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Select a category</option><option>Roads & footpaths</option><option>Waste management</option><option>Water supply</option><option>Street lights</option></select></div></div><button className="primary-button continue-button" disabled={!canContinue} onClick={() => onAnalyze({ text, location, category })}>Analyze my issue <ArrowRight size={18} /></button></div><p className="privacy-note"><ShieldCheck size={15} /> Your report is private until you choose to share it.</p></main></>;
}

function Analysis({ complaint, result, onReview, onBack }) { return <><Header onHome={onBack} compact /><main className="flow-shell"><Stepper step={1} /><div className="flow-heading"><span className="eyebrow">STEP 02 / 03</span><h1>Here’s what we found.</h1><p>Gemma read your report and found a likely path forward.</p></div><div className="analysis-grid"><div className="analysis-main"><div className="loading-badge"><span className="spinner" /> ANALYZING WITH GEMMA</div><div className="analysis-card"><div className="analysis-card-top"><div className="spark-icon"><Sparkles size={19} /></div><div><span className="muted-label">ISSUE SUMMARY</span><h2>{result.summary}</h2></div></div><div className="tag-row"><span className="tag green"><ClipboardList size={14} /> {result.category}</span><span className="tag yellow"><Zap size={14} /> {result.urgency} urgency</span></div></div><div className="action-list"><h3>Suggested next steps</h3>{result.actions.map((action, i) => <div className="action-item" key={action}><span>{i + 1}</span>{action}<Check size={17} /></div>)}</div></div><aside className="detail-card"><span className="muted-label">ROUTE TO</span><div className="department"><div className="department-icon"><Users size={20} /></div><div><b>{result.department}</b><small>PMC, Pune</small></div></div><div className="detail-location"><MapPin size={16} /> {result.location}</div><button className="edit-button" onClick={onBack}><ArrowLeft size={15} /> Edit report</button></aside></div><button className="primary-button continue-button review-button" onClick={onReview}>Review & generate report <ArrowRight size={18} /></button></main></>; }

function Review({ complaint, result, onBack, onDone }) { const [shared, setShared] = useState(false); return <><Header onHome={onBack} compact /><main className="flow-shell"><Stepper step={2} /><div className="flow-heading"><span className="eyebrow">STEP 03 / 03</span><h1>Make it count.</h1><p>Review your report before it enters the civic system.</p></div><div className="report-card"><div className="report-head"><div className="report-logo">पु</div><div><span className="muted-label">PUNESAHAYAK REPORT</span><h2>Road safety concern in {result.location.split(',')[0]}</h2></div><span className="draft-pill">DRAFT</span></div><div className="report-meta"><span><MapPin size={15} /> {result.location}</span><span><ClipboardList size={15} /> {result.category}</span><span><Zap size={15} /> {result.urgency} urgency</span></div><div className="report-body"><span className="muted-label">YOUR REPORT</span><p>“{complaint.text}”</p></div><div className="report-body"><span className="muted-label">RECOMMENDED ACTION</span><p>{result.actions.join('. ')}.</p></div></div><div className="review-actions"><button className="outline-button" onClick={onBack}><ArrowLeft size={17} /> Make edits</button><button className="primary-button" onClick={() => setShared(true)}>{shared ? <><Check size={17} /> Report ready</> : <><Send size={17} /> Generate & share report</>}</button></div>{shared && <div className="success-message"><Check size={19} /><div><b>Report generated successfully!</b><span>Your reference number is <strong>{result.reference}</strong>. You can now share it with PMC.</span></div></div>}</main></>; }

function Insights({ onBack }) { return <><Header onHome={onBack} /><main className="insights-page"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back home</button><div className="flow-heading"><span className="eyebrow">COMMUNITY PULSE</span><h1>What Pune is saying.</h1><p>Real issues from real Punekars, this month.</p></div><div className="insight-overview"><div className="big-stat"><span className="stat-icon"><Users size={19} /></span><strong>1,284</strong><span>issues reported</span><div className="trend">↑ 18% from last month</div></div><div className="big-stat yellow-stat"><span className="stat-icon"><Check size={19} /></span><strong>73%</strong><span>resolved or in progress</span><div className="trend">↑ 9% from last month</div></div><div className="topics"><span className="muted-label">TOP COMMUNITY TOPICS</span>{[['Roads & footpaths','42%'],['Waste management','28%'],['Water & drainage','18%'],['Street lights','12%']].map(([label, val]) => <div key={label}><span>{label}</span><b>{val}</b><i><em style={{ width: val }} /></i></div>)}</div></div><div className="neighbourhood-card"><div><span className="eyebrow">NEIGHBOURHOOD WATCH</span><h2>Issues near you</h2><p>See what’s happening around Pune.</p></div><button className="outline-button">Change area <ChevronDown size={15} /></button><div className="map-placeholder"><MapPin size={31} /><span>Interactive neighbourhood map</span><small>Coming soon · Your privacy is protected</small></div></div></main></>; }

function App() { const [screen, setScreen] = useState('home'); const [complaint, setComplaint] = useState(null); const [result, setResult] = useState(null); const start = () => setScreen('form'); const analyze = async (data) => { setComplaint(data); setScreen('analysis'); const response = await analyzeComplaint(data); setResult(response); }; return screen === 'home' ? <Home onStart={start} onInsights={() => setScreen('insights')} /> : screen === 'form' ? <ComplaintForm onAnalyze={analyze} onBack={() => setScreen('home')} /> : screen === 'analysis' ? <Analysis complaint={complaint} result={result || { summary: 'Reading your report…', category: 'Civic issue', urgency: 'Medium', location: complaint?.location, actions: ['Finding the right department', 'Checking issue urgency', 'Preparing recommendations'], department: 'Pune Municipal Corporation' }} onReview={() => setScreen('review')} onBack={() => setScreen('form')} /> : screen === 'review' ? <Review complaint={complaint} result={result} onBack={() => setScreen('analysis')} onDone={() => setScreen('home')} /> : <Insights onBack={() => setScreen('home')} />; }

import { createRoot } from 'react-dom/client';
createRoot(document.getElementById('root')).render(<App />);
