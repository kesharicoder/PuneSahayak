import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, Globe, Check } from 'lucide-react';
import { MobileNav } from './MobileNav';

export function Header({
  onHome,
  onInsights,
  onStartReport,
  compact = false,
  currentLanguage = 'mr',
  onLanguageChange = () => {}
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close language dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    }
    if (langDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [langDropdownOpen]);

  const toggleLanguage = (lang) => {
    onLanguageChange(lang);
    setLangDropdownOpen(false);
  };

  return (
    <>
      <header className="topbar">
        <button
          className="brand"
          onClick={onHome}
          aria-label="Go to PuneSahayak home"
        >
          <span className="brand-mark">पु</span>
          <span className="brand-text">Pune<span className="brand-accent">Sahayak</span></span>
        </button>

        <nav className={compact ? 'desktop-only' : ''} aria-label="Primary navigation">
          <a
            href="#how"
            onClick={(e) => {
              const el = document.getElementById('how');
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            How it works
          </a>
          <button
            type="button"
            className="nav-link-button"
            onClick={onInsights}
          >
            Community insights
          </button>
        </nav>

        <div className="topbar-actions" ref={dropdownRef}>
          <div className="lang-picker-wrapper">
            <button
              className="outline-button small-button lang-trigger-button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              aria-label="Select language"
              aria-expanded={langDropdownOpen}
              aria-haspopup="listbox"
            >
              <span className="status-dot" />
              <span className="lang-label">{currentLanguage === 'mr' ? 'Marathi' : 'English'}</span>
              <ChevronDown size={14} className={`chevron-icon ${langDropdownOpen ? 'rotated' : ''}`} />
            </button>

            {langDropdownOpen && (
              <div className="lang-dropdown-menu" role="listbox">
                <button
                  className={`lang-menu-item ${currentLanguage === 'mr' ? 'selected' : ''}`}
                  onClick={() => toggleLanguage('mr')}
                  role="option"
                  aria-selected={currentLanguage === 'mr'}
                >
                  <span className="lang-native">मराठी</span>
                  <span className="lang-sub">Marathi</span>
                  {currentLanguage === 'mr' && <Check size={14} className="check-icon" />}
                </button>
                <button
                  className={`lang-menu-item ${currentLanguage === 'en' ? 'selected' : ''}`}
                  onClick={() => toggleLanguage('en')}
                  role="option"
                  aria-selected={currentLanguage === 'en'}
                >
                  <span className="lang-native">English</span>
                  <span className="lang-sub">English</span>
                  {currentLanguage === 'en' && <Check size={14} className="check-icon" />}
                </button>
              </div>
            )}
          </div>

          <button
            className="menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open mobile navigation menu"
            aria-expanded={menuOpen}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      <MobileNav
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigateHome={onHome}
        onNavigateInsights={onInsights}
        onStartReport={onStartReport || onHome}
        currentLanguage={currentLanguage}
        onLanguageChange={toggleLanguage}
      />
    </>
  );
}
