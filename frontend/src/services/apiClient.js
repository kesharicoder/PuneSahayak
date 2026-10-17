import { locationToText } from './geocoding';

const categoryMap = {
  'Roads & footpaths': 'Roads',
  'Waste management': 'Waste Management',
  'Water supply': 'Water Supply',
  'Street lights': 'Streetlights',
  'Traffic & signals': 'Traffic',
  'Drainage & sewerage': 'Drainage',
};

function normalizeAnalysis(response, complaint) {
  const requiredFields = ['category', 'severity', 'summary', 'recommended_department'];
  const hasRequiredFields = requiredFields.every(
    (field) => typeof response?.[field] === 'string' && response[field].trim(),
  );

  if (!hasRequiredFields || !Array.isArray(response.actions)) {
    throw new Error('The analysis service returned an incomplete result. Please try again.');
  }

  const complaintLocation = locationToText(complaint?.location);

  return {
    category: response.category,
    urgency: response.severity,
    location: response.location || complaintLocation || 'Location not provided',
    summary: response.summary,
    actions: response.actions,
    department: response.recommended_department,
    reference: response.reference || null,
    englishReport: response.english_report || response.summary,
    marathiReport: response.marathi_report || response.english_report || response.summary,
    report: response.english_report || response.marathi_report || response.summary,
    missingInformation: Array.isArray(response.missing_information)
      ? response.missing_information.filter((item) => typeof item === 'string' && item.trim())
      : typeof response.missing_information === 'string' && response.missing_information.trim()
        ? [response.missing_information.trim()]
        : [],
    disclaimer: response.disclaimer || null,
  };
}

/**
 * Send a complaint to the same-origin backend API.
 * Provider credentials are intentionally never read or sent by the browser.
 */
export async function analyzeComplaint(complaint, lang = 'auto') {
  if (complaint.image) return analyzeComplaintImage(complaint, lang);

  let response;
  try {
    response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: complaint.text.trim(),
        location: locationToText(complaint.location) || null,
        category: categoryMap[complaint.category] || null,
        language: lang,
        conversation: complaint.conversation || [{ role: 'user', content: complaint.text.trim() }],
      }),
    });
  } catch {
    throw new Error(
      'We couldn’t reach the analysis service. Check that the backend is running on port 8000, then try again.',
    );
  }

  let responseBody = null;
  try {
    responseBody = await response.json();
  } catch {
    // The HTTP status below still gives the user a useful service error.
  }

  if (!response.ok) {
    const detail = typeof responseBody?.detail === 'string'
      ? responseBody.detail
      : response.status >= 500
        ? 'The analysis service is temporarily unavailable.'
        : 'The complaint could not be analyzed. Please check the details and try again.';
    throw new Error(detail);
  }

  return normalizeAnalysis(responseBody, complaint);
}

/**
 * Send a complaint and its image as multipart form data. The image is kept in
 * browser memory only; provider credentials are never read or sent here.
 */
export async function analyzeComplaintImage(complaint, lang = 'auto') {
  const formData = new FormData();
  formData.append('image', complaint.image);
  formData.append('text', complaint.text.trim());
  formData.append('location', locationToText(complaint.location));
  formData.append('category', categoryMap[complaint.category] || '');
  formData.append('language', lang);
  formData.append(
    'conversation',
    JSON.stringify(complaint.conversation || [{ role: 'user', content: complaint.text.trim() }]),
  );

  let response;
  try {
    response = await fetch('/api/analyze-image', {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new Error(
      'We couldn’t reach the analysis service. Check that the backend is running on port 8000, then try again.',
    );
  }

  let responseBody = null;
  try {
    responseBody = await response.json();
  } catch {
    // The HTTP status below still gives the user a useful service error.
  }

  if (!response.ok) {
    const detail = typeof responseBody?.detail === 'string'
      ? responseBody.detail
      : response.status >= 500
        ? 'The analysis service is temporarily unavailable.'
        : 'The image could not be analyzed. Please check the details and try again.';
    throw new Error(detail);
  }

  return normalizeAnalysis(responseBody, complaint);
}
