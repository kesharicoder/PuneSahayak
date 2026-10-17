// Deliberately isolated mock seam. Replace this function with the backend client
// when the complaint-analysis API is ready; no credentials belong in the client.
export function analyzeComplaint(complaint) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve({
      category: complaint.category || 'Roads & footpaths',
      urgency: 'Medium',
      location: complaint.location || 'Kothrud, Pune',
      summary: 'A pothole and broken street edge are making this stretch unsafe for pedestrians and two-wheelers.',
      actions: ['Inspect and barricade the pothole', 'Patch the road surface within 7 days', 'Check nearby street lighting'],
      department: 'Road Department',
      reference: 'PS-2024-0817',
    }), 1250);
  });
}
