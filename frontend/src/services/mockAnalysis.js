// Deliberately isolated mock seam. Replace this function with the backend client
// when the complaint-analysis API is ready; no credentials belong in the client.
export function analyzeComplaint(complaint) {
  const text = (complaint.text || '').toLowerCase();
  
  let category = complaint.category || 'Roads & footpaths';
  let categoryMr = 'रस्ते आणि पदपथ';
  let urgency = 'Medium';
  let urgencyMr = 'मध्यम';
  let department = 'Road Department';
  let departmentMr = 'रस्ते विभाग (PMC)';
  let summary = 'A pothole and broken street edge are making this stretch unsafe for pedestrians and two-wheelers.';
  let summaryMr = 'रस्त्यावरील खड्डा आणि फुटपाथची झालेली दुरवस्था यामुळे पादचारी आणि दुचाकीस्वारांसाठी धोका निर्माण झाला आहे.';
  let actions = [
    'Inspect and barricade the damaged road spot immediately',
    'Patch the road surface within 7 working days',
    'Verify adequate street lighting and drainage clearance'
  ];
  let actionsMr = [
    'तातडीने संबंधित खड्ड्याची पाहणी करून सुरक्षा बॅरिकेड्स लावावे',
    '७ कामकाजाच्या दिवसांत रस्ता दुरुस्ती (पॅचवर्क) पूर्ण करावे',
    'परिसरातील पथदिवे व गटारांची स्वच्छता तपासून घ्यावी'
  ];

  if (text.includes('kachra') || text.includes('waste') || text.includes('garbage') || text.includes('कचरा')) {
    category = 'Waste management';
    categoryMr = 'घनकचरा व्यवस्थापन';
    urgency = 'High';
    urgencyMr = 'तातडीचे (High)';
    department = 'Solid Waste Management Dept';
    departmentMr = 'घनकचरा व्यवस्थापन विभाग (PMC)';
    summary = 'Accumulated uncollected waste near public area posing severe sanitation and health risk.';
    summaryMr = 'सार्वजनिक जागेवर साठलेला कचरा वेळेवर न उचलल्यामुळे दुर्गंधी आणि आरोग्याचा प्रश्न निर्माण झाला आहे.';
    actions = [
      'Deploy ward collection vehicle within 24 hours',
      'Disinfect the disposal spot with bleaching powder',
      'Schedule regular daily morning monitoring in this ward'
    ];
    actionsMr = [
      '२४ तासांत कचरा उचलणारी गाडी पाठवून परिसर स्वच्छ करावा',
      'कचरा टाकलेल्या जागेवर जंतुनाशक पावडरची फवारणी करावी',
      'या प्रभागामध्ये दररोज सकाळी नियमित कचरा संकलन निश्चित करावे'
    ];
  } else if (text.includes('water') || text.includes('paani') || text.includes('drainage') || text.includes('पाणी')) {
    category = 'Water supply & drainage';
    categoryMr = 'पाणीपुरवठा व मलनिःसारण';
    urgency = 'High';
    urgencyMr = 'तातडीचे (High)';
    department = 'Water Supply Department';
    departmentMr = 'पाणीपुरवठा विभाग (PMC)';
    summary = 'Irregular water supply or pipeline leakage causing disruption to local residents.';
    summaryMr = 'कमी दाबाने पाणीपुरवठा किंवा जलवाहिनी गळतीमुळे स्थानिक नागरिकांना पाणीटंचाईचा सामना करावा लागत आहे.';
    actions = [
      'Check pipeline pressure at the distribution valve',
      'Inspect for underground leaks or illegal tap connections',
      'Provide temporary tanker relief if outage exceeds 24 hrs'
    ];
    actionsMr = [
      'व्हॉल्व्ह पॉइंटवरील पाणीपुरवठा दाबाची त्वरित तपासणी करावी',
      'भूमिगत गळती अथवा अवैध जोडणी आहे का याची खात्री करावी',
      '२४ तासांपेक्षा जास्त अडचण असल्यास पर्यायी टँकरची सोय करावी'
    ];
  } else if (text.includes('light') || text.includes('diwa') || text.includes('street light') || text.includes('दिवा') || text.includes('अंधार')) {
    category = 'Street lights';
    categoryMr = 'विद्युत व पथदिवे';
    urgency = 'Medium';
    urgencyMr = 'मध्यम';
    department = 'Electrical Department';
    departmentMr = 'विद्युत विभाग (PMC)';
    summary = 'Non-functional or flickering streetlights causing dark stretches and safety risks.';
    summaryMr = 'बंद अथवा वारंवार बंद होणाऱ्या पथदिव्यांमुळे रात्रीच्या वेळी नागरिकांच्या सुरक्षेचा प्रश्न निर्माण झाला आहे.';
    actions = [
      'Replace faulty LED fixture or repair wiring circuit',
      'Verify automated timer sensor switch on pole',
      'Complete repair within 48 hours as per citizen charter'
    ];
    actionsMr = [
      'दोषी एलईडी दिवा अथवा वायरिंग तातडीने दुरुस्त करावी',
      'खांबावरील स्वयंचलित टाइमर सेन्सरची तपासणी करावी',
      'नागरी सनदेनुसार ४८ तासांच्या आत दुरुस्ती पूर्ण करावी'
    ];
  }

  // Detect missing information (PRD FR-07)
  const missingInfo = [];
  if (!complaint.text || complaint.text.length < 40) {
    missingInfo.push('Exact landmark, road name, or nearest shop name');
  }
  if (!complaint.image) {
    missingInfo.push('A clear daytime photo of the affected spot (optional but recommended)');
  }

  return new Promise((resolve) => {
    window.setTimeout(() => resolve({
      category,
      categoryMr,
      urgency,
      urgencyMr,
      location: complaint.location || 'Kothrud, Pune',
      summary,
      summaryMr,
      actions,
      actionsMr,
      department,
      departmentMr,
      missingInfo,
      reference: 'PS-2024-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    }), 1000);
  });
}
