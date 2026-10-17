export function locationToText(location) {
  if (!location) return '';
  if (typeof location === 'string') return location;
  return location.address || (location.lat && location.lng ? `${location.lat}, ${location.lng}` : '');
}

const categoryMap = {
  'Roads & footpaths': 'Roads',
  'Waste management': 'Waste Management',
  'Water supply': 'Water Supply',
  'Street lights': 'Streetlights',
  'Traffic & signals': 'Traffic',
  'Drainage & sewerage': 'Drainage',
};

function generateFallbackAnalysis(complaint, lang = 'auto') {
  const loc = locationToText(complaint?.location) || 'Pune';
  const text = complaint?.text || '';
  const lower = text.toLowerCase();

  let category = 'Roads & footpaths';
  let dept = 'Road Department, PMC';
  let severity = 'Medium';
  let summary = `Civic complaint regarding road conditions in ${loc}.`;
  let englishReport = `Dear PMC Officer,\n\nWe would like to report an urgent civic issue in ${loc}: "${text}". This is creating an inconvenience and hazard for local residents. We kindly request an on-site inspection and swift remediation.\n\nThank you,\nConcerned Citizen`;
  let marathiReport = `प्रति, संबंधित अधिकारी, पुणे महानगरपालिका,\n\n${loc} परिसरात खालील नागरी समस्येची तक्रार नोंदवण्यात येत आहे: "${text}". यामुळे स्थानिक रहिवासी आणि प्रवाशांना त्रास होत असून धोका निर्माण झाला आहे. कृपया त्वरित पाहणी करून आवश्यक ती दुरुस्ती करावी.\n\nआपला नम्र नागरिक`;
  let actions = [
    'Log official grievance in Pune Municipal Corporation portal',
    'Assign field junior engineer for site inspection within 48 hours',
    'Deploy field maintenance crew with repair equipment',
    'Verify repair quality and update resolution status',
  ];

  if (lower.includes('garbage') || lower.includes('waste') || lower.includes('कचरा') || lower.includes('dump')) {
    category = 'Waste management';
    dept = 'Solid Waste Management Department, PMC';
    summary = `Uncollected waste and garbage accumulation reported in ${loc}.`;
    actions = [
      'Dispatch sanitation truck and collection team to cleared site',
      'Sanitize the area with bleaching powder and pest deterrent',
      'Monitor scheduled morning waste collection route in the ward',
    ];
  } else if (lower.includes('water') || lower.includes('pipe') || lower.includes('leak') || lower.includes('पाणी') || lower.includes('जल')) {
    category = 'Water supply';
    dept = 'Water Supply & Pumping Department, PMC';
    summary = `Water supply disruption or pipeline issue reported in ${loc}.`;
    actions = [
      'Inspect main distribution pipeline for pressure or leakage',
      'Dispatch valve technician to normalize supply pressure',
      'Provide water tanker relief if supply remains interrupted',
    ];
  } else if (lower.includes('light') || lower.includes('dark') || lower.includes('दिवा') || lower.includes('दिवे') || lower.includes('electric')) {
    category = 'Street lights';
    dept = 'Electrical Department, PMC';
    summary = `Streetlight non-functioning or darkness hazard in ${loc}.`;
    actions = [
      'Inspect feeder pillar box and circuit breakers',
      'Replace burnt LED luminaire or damaged cabling',
      'Verify nighttime illumination with ward monitoring supervisor',
    ];
  } else if (lower.includes('drain') || lower.includes('sewer') || lower.includes('चेंबर') || lower.includes('सांडपाणी') || lower.includes('gutter')) {
    category = 'Drainage & sewerage';
    dept = 'Drainage & Sewerage Department, PMC';
    summary = `Clogged drainage or overflowing sewer line in ${loc}.`;
    actions = [
      'Deploy suction cum jetting machine to clear blockages',
      'Inspect and secure chamber covers to prevent road hazards',
      'Disinfect surrounding roadway with lime and bactericide',
    ];
  } else if (lower.includes('traffic') || lower.includes('signal') || lower.includes('वाहतूक') || lower.includes('jam')) {
    category = 'Traffic & signals';
    dept = 'Traffic Police & Road Transport Division, Pune';
    summary = `Traffic congestion or faulty signal timing in ${loc}.`;
    actions = [
      'Synchronize traffic signal cycle for peak commute hours',
      'Depute traffic warden at critical junction during peak rush',
      'Inspect road lane markings and clearance',
    ];
  }

  if (lower.includes('urgent') || lower.includes('hazard') || lower.includes('accident') || lower.includes('धोका') || lower.includes('danger') || lower.includes('night') || lower.includes('deep')) {
    severity = 'High';
  }

  return {
    category: categoryMap[complaint?.category] || category,
    urgency: severity,
    location: loc,
    summary,
    actions,
    department: dept,
    reference: `PMC-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    englishReport,
    marathiReport,
    report: lang === 'mr' ? marathiReport : englishReport,
    missingInformation: [],
    disclaimer: 'Generated via PuneSahayak Civic Intelligence System.',
  };
}

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
 * Falls back to local civic analysis if the backend server is offline.
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
  } catch (err) {
    console.warn('Backend unavailable, using client-side civic analysis engine:', err);
    return generateFallbackAnalysis(complaint, lang);
  }

  let responseBody = null;
  try {
    responseBody = await response.json();
  } catch {
    // ignore
  }

  if (!response.ok) {
    return generateFallbackAnalysis(complaint, lang);
  }

  return normalizeAnalysis(responseBody, complaint);
}

/**
 * Send a complaint and its image as multipart form data.
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
  } catch (err) {
    console.warn('Backend image analysis unavailable, using client-side engine:', err);
    return generateFallbackAnalysis(complaint, lang);
  }

  let responseBody = null;
  try {
    responseBody = await response.json();
  } catch {
    // ignore
  }

  if (!response.ok) {
    return generateFallbackAnalysis(complaint, lang);
  }

  return normalizeAnalysis(responseBody, complaint);
}
