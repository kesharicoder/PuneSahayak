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

  return {
    category: response.category,
    urgency: response.severity,
    location: response.location || complaint.location || 'Location not provided',
    summary: response.summary,
    actions: response.actions,
    department: response.recommended_department,
    reference: response.reference || null,
    englishReport: response.english_report || response.summary,
    marathiReport: response.marathi_report || response.english_report || response.summary,
    report: response.english_report || response.marathi_report || response.summary,
  };
}

/**
 * Send a complaint to the same-origin backend API.
 * Provider credentials are intentionally never read or sent by the browser.
 */
export async function analyzeComplaint(complaint, lang = 'auto') {
  let response;
  try {
    response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: complaint.text.trim(),
        location: complaint.location?.trim() || null,
        category: categoryMap[complaint.category] || null,
        language: lang,
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
