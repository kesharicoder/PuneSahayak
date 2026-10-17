import { useEffect } from 'react';
import { X, Globe, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export function MobileNav({
  isOpen,
  onClose,
  onNavigateHome,
  onNavigateInsights,
  onStartReport,
  currentLanguage,
  onLanguageChange
}) {
  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="mobile-nav-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Mobile Navigation">
      <div className="mobile-nav-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-nav-header">
          <div className="brand">
            <span className="brand-mark">पु</span>
            <span>Pune<span className="brand-accent">Sahayak</span></span>
          </div>
          <button
            className="icon-button close-button"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="mobile-nav-links">
          <button
            className="mobile-nav-link"
            onClick={() => {
              onClose();
              onNavigateHome();
            }}
          >
            <span>Home</span>
            <ArrowRight size={18} />
          </button>

          <a
            href="#how"
            className="mobile-nav-link"
            onClick={(e) => {
              onClose();
              const el = document.getElementById('how');
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <span>How it works</span>
            <ArrowRight size={18} />
          </a>

          <button
            className="mobile-nav-link"
            onClick={() => {
              onClose();
              onNavigateInsights();
            }}
          >
            <span>Community insights</span>
            <ArrowRight size={18} />
          </button>
        </nav>

        <div className="mobile-nav-section">
          <span className="muted-label">CHOOSE LANGUAGE / भाषा निवडा</span>
          <div className="language-toggle-grid">
            <button
              className={`lang-option ${currentLanguage === 'mr' ? 'active' : ''}`}
              onClick={() => onLanguageChange('mr')}
            >
              <span>मराठी (Marathi)</span>
              {currentLanguage === 'mr' && <Check size={16} />}
            </button>
            <button
              className={`lang-option ${currentLanguage === 'en' ? 'active' : ''}`}
              onClick={() => onLanguageChange('en')}
            >
              <span>English</span>
              {currentLanguage === 'en' && <Check size={16} />}
            </button>
          </div>
        </div>

        <div className="mobile-nav-footer">
          <button
            className="primary-button mobile-report-cta"
            onClick={() => {
              onClose();
              onStartReport();
            }}
          >
            Report an issue <ArrowRight size={18} />
          </button>
          <div className="trust-line mobile-trust">
            <ShieldCheck size={16} />
            <span>Private by default · No citizen login required</span>
          </div>
        </div>
      </div>
    </div>
  );
}
