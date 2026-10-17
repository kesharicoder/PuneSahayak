import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { locationToText } from './apiClient';

const PDF_FONT_STACK = '"Nirmala UI", "Noto Sans Devanagari", "Mangal", "Arial Unicode MS", sans-serif';
const PDF_PAGE_WIDTH = 210;
const PDF_PAGE_HEIGHT = 297;
const PDF_MARGIN = 15;
const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN * 2;
const PDF_CONTENT_HEIGHT = PDF_PAGE_HEIGHT - PDF_MARGIN * 2;
const PDF_RENDER_TIMEOUT_MS = 20_000;

function imageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Image could not be read'));
    reader.readAsDataURL(file);
  });
}

function waitForImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image could not be loaded'));
    image.src = dataUrl;
  });
}

function createElement(tag, text = '', styles = {}) {
  const element = document.createElement(tag);
  if (text !== '') element.textContent = String(text);
  Object.assign(element.style, styles);
  return element;
}

function appendSection(root, title, value, styles = {}) {
  const section = createElement('section', '', {
    marginBottom: '14px',
    breakInside: 'avoid',
    ...styles,
  });
  section.appendChild(createElement('div', title.toUpperCase(), {
    color: '#174b35',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    marginBottom: '6px',
  }));
  section.appendChild(createElement('div', value ?? '—', {
    color: '#193129',
    fontSize: '13px',
    lineHeight: '1.55',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  }));
  root.appendChild(section);
  return section;
}

function appendReportLanguageCard(root, title, value, background) {
  const card = createElement('section', '', {
    background,
    border: '1px solid #dce9df',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '14px',
    breakInside: 'avoid',
  });
  card.appendChild(createElement('div', title, {
    color: '#174b35',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    marginBottom: '6px',
  }));
  card.appendChild(createElement('div', value ?? '—', {
    color: '#193129',
    fontSize: '13px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  }));
  root.appendChild(card);
}

function createReportDocument(complaint, result, imageDataUrl) {
  const location = result.location || locationToText(complaint?.location) || 'Location not provided';
  const root = createElement('article', '', {
    width: '760px',
    boxSizing: 'border-box',
    padding: '32px 36px',
    background: '#ffffff',
    color: '#193129',
    fontFamily: PDF_FONT_STACK,
    fontSize: '13px',
    lineHeight: '1.5',
  });

  const header = createElement('header', '', {
    background: '#174b35',
    color: '#ffffff',
    padding: '20px 24px',
    borderRadius: '12px',
    marginBottom: '24px',
    breakInside: 'avoid',
  });
  const headerTitle = createElement('div', 'PuneSahayak', {
    fontSize: '25px',
    fontWeight: '700',
    lineHeight: '1.2',
  });
  const headerSubtitle = createElement('div', 'Civic complaint report', {
    fontSize: '13px',
    marginTop: '8px',
    opacity: '0.9',
  });
  header.append(headerTitle, headerSubtitle);
  if (result.reference) {
    header.appendChild(createElement('div', `Reference: ${result.reference}`, {
      fontSize: '11px',
      marginTop: '6px',
      opacity: '0.85',
    }));
  }
  root.appendChild(header);

  root.appendChild(createElement('h1', `Civic concern in ${location.split(',')[0] || 'Pune'}`, {
    color: '#174b35',
    fontSize: '22px',
    lineHeight: '1.25',
    margin: '0 0 22px',
    fontWeight: '700',
  }));

  appendSection(root, 'Complaint', complaint.text);
  appendSection(root, 'Location', location);
  appendSection(root, 'Category', result.category);
  appendSection(root, 'Urgency', result.urgency);
  appendSection(root, 'Department', result.department);

  if (imageDataUrl) {
    const imageSection = createElement('section', '', {
      marginBottom: '16px',
      breakInside: 'avoid',
    });
    imageSection.appendChild(createElement('div', 'ATTACHED IMAGE', {
      color: '#174b35',
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.08em',
      marginBottom: '6px',
    }));
    const image = createElement('img', '', {
      display: 'block',
      maxWidth: '100%',
      maxHeight: '260px',
      objectFit: 'contain',
      borderRadius: '8px',
      border: '1px solid #dce9df',
    });
    image.src = imageDataUrl;
    image.alt = 'Complaint evidence';
    imageSection.appendChild(image);
    root.appendChild(imageSection);
  }

  appendSection(root, 'Issue summary', result.summary);
  appendReportLanguageCard(root, 'REPORT (ENGLISH)', result.englishReport, '#f0f7f2');
  appendReportLanguageCard(root, 'REPORT (MARATHI)', result.marathiReport, '#f4f8f8');
  appendSection(root, 'Recommended actions', result.actions?.length ? result.actions.join(' • ') : result.report);
  appendSection(
    root,
    'Disclaimer',
    result.disclaimer || 'This report is an AI-assisted draft for civic follow-up. Please verify the details and submit it through the appropriate official channel.',
    { borderTop: '1px solid #dce9df', paddingTop: '14px' },
  );
  root.appendChild(createElement('footer', 'Generated by PuneSahayak · Keep this report for your records.', {
    color: '#6d7e75',
    fontSize: '10px',
    marginTop: '22px',
    paddingTop: '12px',
    borderTop: '1px solid #e6ece7',
  }));

  return root;
}

function withTimeout(promise, timeoutMs, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
}

async function renderHtmlToPdf(doc, root) {
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:760px;background:#fff;z-index:-1;';
  host.appendChild(root);
  document.body.appendChild(host);

  try {
    // Render with the browser first. This keeps Devanagari glyphs intact and
    // avoids the unresolved callback/hang that can occur in jsPDF.html().
    const canvas = await withTimeout(
      html2canvas(root, {
        scale: 1.5,
        backgroundColor: '#ffffff',
        imageTimeout: 5000,
        logging: false,
        windowWidth: 760,
        scrollX: 0,
        scrollY: 0,
      }),
      PDF_RENDER_TIMEOUT_MS,
      'PDF rendering took too long. Please try again.',
    );

    if (!canvas.width || !canvas.height) {
      throw new Error('PDF rendering produced an empty document.');
    }

    // Slice the browser-rendered canvas into A4 pages. A direct image slice is
    // reliable across browsers and avoids waiting for a jsPDF HTML callback.
    const pagePixelHeight = Math.max(
      1,
      Math.floor(canvas.width * (PDF_CONTENT_HEIGHT / PDF_CONTENT_WIDTH)),
    );
    const pageCanvas = document.createElement('canvas');
    const context = pageCanvas.getContext('2d');
    if (!context) throw new Error('Could not prepare the PDF canvas.');

    let offset = 0;
    let pageIndex = 0;
    while (offset < canvas.height) {
      const sliceHeight = Math.min(pagePixelHeight, canvas.height - offset);
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      context.drawImage(
        canvas,
        0,
        offset,
        canvas.width,
        sliceHeight,
        0,
        0,
        pageCanvas.width,
        pageCanvas.height,
      );

      if (pageIndex > 0) doc.addPage();
      const imageHeight = (sliceHeight / canvas.width) * PDF_CONTENT_WIDTH;
      doc.addImage(
        pageCanvas.toDataURL('image/jpeg', 0.94),
        'JPEG',
        PDF_MARGIN,
        PDF_MARGIN,
        PDF_CONTENT_WIDTH,
        imageHeight,
        undefined,
        'FAST',
      );
      offset += sliceHeight;
      pageIndex += 1;
    }

    return doc;
  } finally {
    host.remove();
  }
}

/**
 * Create and download the complete bilingual complaint report in the browser.
 *
 * jsPDF's built-in Helvetica/Times fonts do not contain Devanagari glyphs.
 * Rendering the report through the browser lets the operating system's
 * Devanagari font fallback draw Marathi correctly before html2canvas places it
 * into the PDF. This keeps the PDF readable without exposing or bundling a
 * private font file.
 */
export async function downloadReportPdf(complaint, result) {
  let imageDataUrl = null;
  if (complaint.image) {
    try {
      imageDataUrl = await imageAsDataUrl(complaint.image);
      await waitForImage(imageDataUrl);
    } catch {
      imageDataUrl = null;
    }
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const root = createReportDocument(complaint, result, imageDataUrl);
  const pdf = await renderHtmlToPdf(doc, root);
  const filenameLocation = (result.location || locationToText(complaint?.location) || 'pune')
    .split(',')[0]
    .trim()
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase();
  pdf.save(`punesahayak-${filenameLocation || 'civic-report'}.pdf`);
}
