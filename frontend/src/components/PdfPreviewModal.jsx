import { useState, useEffect } from 'react';
import { X, Printer, Copy, Check, FileDown, ShieldCheck, ExternalLink } from 'lucide-react';

export function PdfPreviewModal({
  isOpen,
  onClose,
  complaint,
  result
}) {
  const [copied, setCopied] = useState(false);

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

  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const reportText = `================================================
PUNESAHAYAK CIVIC COMPLAINT REPORT
Reference: ${result.reference}
Date: ${result.createdAt || new Date().toLocaleDateString('en-IN')}
Ward / Location: ${result.location}
Category: ${result.category}
Assigned Department: ${result.department}
Urgency Level: ${result.urgency}
------------------------------------------------
CITIZEN STATEMENT:
"${complaint?.text || ''}"

SUMMARY (English):
${result.summary}

सारांश (मराठी):
${result.summaryMr || ''}

RECOMMENDED PMC ACTIONS:
${(result.actions || []).map((a, i) => `${i + 1}. ${a}`).join('\n')}
================================================
Generated via PuneSahayak (Gemma 4 Civic Intelligence)`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div
      className="modal-backdrop pdf-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-preview-title"
    >
      <div className="pdf-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Toolbar (hidden on print) */}
        <div className="pdf-modal-toolbar no-print">
          <div className="pdf-toolbar-info">
            <h3 id="pdf-preview-title">Official Civic Report Dossier</h3>
            <span className="pdf-doc-badge">A4 Standard Format</span>
          </div>

          <div className="pdf-toolbar-actions">
            <button
              type="button"
              className="outline-button small-button"
              onClick={handleCopyText}
              title="Copy formatted text"
            >
              {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy text</>}
            </button>
            <button
              type="button"
              className="primary-button small-button print-cta-btn"
              onClick={handlePrint}
              title="Print or Save as PDF"
            >
              <Printer size={15} /> Print / Save PDF
            </button>
            <button
              type="button"
              className="icon-button close-pdf-btn"
              onClick={onClose}
              aria-label="Close report preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Viewport Wrapper for the Screen */}
        <div className="pdf-viewport-scroll">
          {/* Printable A4 Document Sheet */}
          <article className="official-pdf-sheet" id="official-citizen-report">
            {/* Header / Letterhead */}
            <header className="pdf-doc-header">
              <div className="pdf-brand-lockup">
                <div className="pdf-logo-mark">पु</div>
                <div>
                  <h1 className="pdf-org-title">PUNESAHAYAK</h1>
                  <p className="pdf-org-sub">CITIZEN GRIEVANCE DOSSIER · पुणे महापालिका जनहित मंच</p>
                </div>
              </div>
              <div className="pdf-ref-block">
                <div className="pdf-ref-number">
                  <span className="ref-label">REF ID:</span>
                  <span className="ref-code">{result.reference}</span>
                </div>
                <div className="pdf-date">Date: {result.createdAt || new Date().toLocaleDateString('en-IN')}</div>
                <span className="pdf-verified-stamp">PMC READY</span>
              </div>
            </header>

            {/* Document Title Banner */}
            <div className="pdf-banner">
              <h2>CIVIC INFRASTRUCTURE & SERVICE COMPLAINT</h2>
              <p>नागरी समस्या व तक्रार निवारण अर्ज — प्रभागीय कार्यालय</p>
            </div>

            {/* Structured Metadata Grid */}
            <section className="pdf-grid-section">
              <div className="pdf-meta-cell">
                <span className="cell-label">LOCALITY / WARD</span>
                <span className="cell-value">{result.location}</span>
              </div>
              <div className="pdf-meta-cell">
                <span className="cell-label">CIVIC CATEGORY</span>
                <span className="cell-value">{result.category}</span>
              </div>
              <div className="pdf-meta-cell">
                <span className="cell-label">PMC DEPARTMENT</span>
                <span className="cell-value">{result.department}</span>
              </div>
              <div className="pdf-meta-cell">
                <span className="cell-label">ASSESSED URGENCY</span>
                <span className={`cell-value urgency-tag-${(result.urgency || '').toLowerCase()}`}>
                  {result.urgency} Urgency
                </span>
              </div>
            </section>

            {/* Section 1: Citizen Original Statement */}
            <section className="pdf-section">
              <h3 className="pdf-section-title">1. Citizen's Primary Grievance / मूळ तक्रार</h3>
              <div className="pdf-callout-box">
                <p className="pdf-complaint-quote">“{complaint?.text || 'No description provided'}”</p>
                {complaint?.image && (
                  <div className="pdf-evidence-block">
                    <span className="evidence-title">ATTACHED PHOTOGRAPHIC EVIDENCE:</span>
                    <div className="pdf-img-frame">
                      <img
                        src={complaint.image.dataUrl}
                        alt="Citizen uploaded evidence"
                        className="pdf-attached-img"
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section 2: AI Analysis & Findings (Bilingual) */}
            <section className="pdf-section">
              <h3 className="pdf-section-title">2. Gemma 4 Analysis & Structured Finding / समस्या विश्लेषण</h3>
              <div className="pdf-bilingual-block">
                <div className="pdf-lang-column">
                  <span className="lang-header-pill">ENGLISH SUMMARY</span>
                  <p>{result.summary}</p>
                </div>
                {result.summaryMr && (
                  <div className="pdf-lang-column mr-column">
                    <span className="lang-header-pill">मराठी सारांश</span>
                    <p className="marathi-font">{result.summaryMr}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Section 3: Recommended Next Steps Protocol */}
            <section className="pdf-section">
              <h3 className="pdf-section-title">3. Recommended Municipal Action Protocol / शिफारस केलेल्या उपाययोजना</h3>
              <ol className="pdf-actions-ordered">
                {(result.actions || []).map((action, i) => (
                  <li key={i} className="pdf-action-row">
                    <span className="action-row-num">{i + 1}</span>
                    <span className="action-row-text">{action}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Document Footer & Sign-off Block */}
            <footer className="pdf-doc-footer">
              <div className="pdf-footer-note">
                <ShieldCheck size={16} />
                <span>
                  Generated via PuneSahayak Open Civic Tech. Verified by citizen prior to submission.
                  Privacy protected — no citizen PII stored without explicit consent.
                </span>
              </div>
              <div className="pdf-sign-row">
                <div className="sign-box">
                  <span className="sign-line" />
                  <span className="sign-label">Citizen Verification Signature</span>
                </div>
                <div className="sign-box">
                  <span className="sign-line" />
                  <span className="sign-label">PMC Ward Officer Seal / Receipt</span>
                </div>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
