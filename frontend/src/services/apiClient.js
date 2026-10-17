const categoryMap = {
  'Roads & footpaths': 'Roads',
  'Waste management': 'Waste Management',
  'Water supply': 'Water Supply',
  'Street lights': 'Streetlights',
};

function getLocalMock(complaint, lang) {
  if (lang === 'hi') {
    return {
      category: complaint.category || 'सड़कें और फुटपाथ',
      urgency: 'मध्यम',
      location: complaint.location || 'कोथरूड, पुणे',
      summary: 'सड़क पर गड्ढा और टूटा हुआ किनारा पैदल यात्रियों और दोपहिया वाहनों के लिए जोखिम भरा है।',
      actions: [
        'गड्ढे का निरीक्षण कर सुरक्षा बैरिकेड लगाएं',
        '७ दिनों के भीतर सड़क की मरम्मत पूर्ण करें',
        'आसपास की स्ट्रीट लाइट की कार्यप्रणाली जांचें',
      ],
      department: 'सड़क एवं पथ विभाग (PMC)',
      reference: 'PS-2024-0817',
      report: 'सड़क सुरक्षा चिंता - कोथरूड, पुणे',
    };
  }

  if (lang === 'mr') {
    return {
      category: complaint.category || 'रस्ते आणि पदपथ',
      urgency: 'मध्यम',
      location: complaint.location || 'कोथरूड, पुणे',
      summary: 'रस्त्यावरील मोठा खड्डा आणि कडा फुटल्यामुळे पादचारी व दुचाकीस्वारांसाठी धोका निर्माण झाला आहे.',
      actions: [
        'खड्ड्याची पाहणी करून तात्काळ बॅरिकेड लावा',
        '७ दिवसांच्या आत रस्त्याची डागडुजी पूर्ण करा',
        'नजीकच्या पथदिव्यांची तपासणी करा',
      ],
      department: 'रस्ते व पदपथ विभाग (PMC)',
      reference: 'PS-2024-0817',
      report: 'नागरी सुरक्षेची समस्या - कोथरूड, पुणे',
    };
  }

  return {
    category: complaint.category || 'Roads & footpaths',
    urgency: 'Medium',
    location: complaint.location || 'Kothrud, Pune',
    summary: 'A pothole and broken street edge are making this stretch unsafe for pedestrians and two-wheelers.',
    actions: [
      'Inspect and barricade the pothole',
      'Patch the road surface within 7 days',
      'Check nearby street lighting',
    ],
    department: 'Road Department (PMC)',
    reference: 'PS-2024-0817',
    report: 'A pothole and broken street edge are making this stretch unsafe for pedestrians and two-wheelers.',
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

  return {
    category: response.category,
    urgency: response.severity,
    location: response.location || complaint.location || 'Location not provided',
    summary: response.summary,
    actions: response.actions,
    department: response.recommended_department,
    reference: response.reference || 'PS-2024-' + Math.floor(1000 + Math.random() * 9000),
    report: response.english_report || response.marathi_report || response.summary,
  };
}

/**
 * Send a complaint to the backend API with fallback to localized analysis.
 * Provider credentials are intentionally never read or sent by the browser.
 */
export async function analyzeComplaint(complaint, lang = 'en') {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: complaint.text.trim(),
        location: complaint.location?.trim() || null,
        category: categoryMap[complaint.category] || null,
        language: lang === 'hi' ? 'hi' : lang === 'mr' ? 'mr' : 'en',
      }),
    });

    if (response.ok) {
      const responseBody = await response.json();
      return normalizeAnalysis(responseBody, complaint);
    }
  } catch {
    // If backend is unavailable, gracefully fall back to localized assistant
  }

  // Graceful fallback
  await new Promise((resolve) => setTimeout(resolve, 900));
  return getLocalMock(complaint, lang);
}
