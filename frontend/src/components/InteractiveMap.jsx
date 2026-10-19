import { useState } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

// Representative Pune civic spots and wards
const PUNE_WARDS = [
  { id: 'kothrud', name: 'Kothrud', cx: 160, cy: 190, issues: 4, open: 2, resolved: 2, dominant: 'Roads & footpaths', type: 'pothole' },
  { id: 'shivajinagar', name: 'Shivajinagar', cx: 270, cy: 150, issues: 6, open: 3, resolved: 3, dominant: 'Traffic & signals', type: 'light' },
  { id: 'swargate', name: 'Swargate', cx: 280, cy: 260, issues: 5, open: 2, resolved: 3, dominant: 'Drainage & water', type: 'water' },
  { id: 'baner', name: 'Baner - Balewadi', cx: 110, cy: 100, issues: 3, open: 1, resolved: 2, dominant: 'Waste management', type: 'garbage' },
  { id: 'hadapsar', name: 'Hadapsar', cx: 430, cy: 270, issues: 7, open: 4, resolved: 3, dominant: 'Waste & garbage', type: 'garbage' },
  { id: 'vimannagar', name: 'Viman Nagar', cx: 420, cy: 140, issues: 3, open: 1, resolved: 2, dominant: 'Roads & footpaths', type: 'pothole' },
  { id: 'yerawada', name: 'Yerawada', cx: 350, cy: 110, issues: 4, open: 2, resolved: 2, dominant: 'Street lights', type: 'light' },
  { id: 'katraj', name: 'Katraj - Dhankawadi', cx: 230, cy: 340, issues: 5, open: 2, resolved: 3, dominant: 'Water supply', type: 'water' },
];

export function InteractiveMap({
  selectedLocation,
  onSelectLocation,
  isPicker = false
}) {
  const [activeWard, setActiveWard] = useState(
    PUNE_WARDS.find(w => selectedLocation && selectedLocation.toLowerCase().includes(w.name.toLowerCase())) || PUNE_WARDS[0]
  );
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.8), 1.6));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setActiveWard(PUNE_WARDS[0]);
  };

  const handleSelect = (ward) => {
    setActiveWard(ward);
    if (onSelectLocation) {
      onSelectLocation(`${ward.name}, Pune`);
    }
  };

  return (
    <div className="interactive-map-card">
      <div className="map-toolbar">
        <div className="map-title-bar">
          <MapPin size={16} className="pin-icon" />
          <span className="map-title">
            {isPicker ? 'Select Pune Locality on Map' : 'Pune Municipal Corporation — Ward Watch'}
          </span>
        </div>

        <div className="map-controls" aria-label="Map zoom controls">
          <button
            type="button"
            className="map-ctrl-btn"
            onClick={() => handleZoom(0.2)}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            className="map-ctrl-btn"
            onClick={() => handleZoom(-0.2)}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            className="map-ctrl-btn"
            onClick={handleReset}
            aria-label="Reset map"
            title="Reset map view"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Ward Quick Select Pills for mobile usability */}
      <div className="ward-pills-scroll" role="tablist" aria-label="Pune local wards">
        {PUNE_WARDS.map((w) => (
          <button
            key={w.id}
            type="button"
            role="tab"
            aria-selected={activeWard.id === w.id}
            className={`ward-pill ${activeWard.id === w.id ? 'active' : ''}`}
            onClick={() => handleSelect(w)}
          >
            <span className="ward-pill-dot" />
            {w.name}
          </button>
        ))}
      </div>

      {/* Responsive SVG Map Canvas */}
      <div className="map-canvas-container">
        <svg
          viewBox="0 0 540 400"
          className="pune-svg-canvas"
          style={{ transform: `scale(${zoomLevel})` }}
          aria-label="Interactive map of Pune wards"
        >
          <defs>
            <radialGradient id="puneGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#174b35" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#174b35" stopOpacity="0" />
            </radialGradient>
            <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background Pune Area Silhouette */}
          <rect width="540" height="400" fill="transparent" />
          <path
            d="M 90 90 Q 200 40 360 80 Q 480 120 480 230 Q 460 340 310 370 Q 180 380 120 310 Q 60 220 90 90 Z"
            fill="#e2efe6"
            stroke="#b8d6c2"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Mutha & Mula Rivers Schematic */}
          <path
            d="M 60 180 Q 180 170 250 160 T 360 140 T 490 150"
            fill="none"
            stroke="#91c1db"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.6"
          />
          <text x="70" y="170" fill="#699ab5" fontSize="10" fontStyle="italic">Mula-Mutha River</text>

          {/* Major arterial road grid rings */}
          <circle cx="270" cy="200" r="85" fill="none" stroke="#ceddd2" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="270" cy="200" r="160" fill="none" stroke="#ceddd2" strokeWidth="1" strokeDasharray="5 5" />
          <line x1="90" y1="90" x2="450" y2="310" stroke="#ceddd2" strokeWidth="1.5" />
          <line x1="120" y1="310" x2="430" y2="100" stroke="#ceddd2" strokeWidth="1.5" />

          {/* Interactive Ward Pins */}
          {PUNE_WARDS.map((w) => {
            const isSelected = activeWard.id === w.id;
            return (
              <g
                key={w.id}
                className={`map-ward-node ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(w)}
                style={{ cursor: 'pointer' }}
                tabIndex={0}
                role="button"
                aria-label={`${w.name}: ${w.issues} issues reported`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(w);
                  }
                }}
              >
                {/* Pulse ring for active ward */}
                {isSelected && (
                  <circle
                    cx={w.cx}
                    cy={w.cy}
                    r="24"
                    fill="none"
                    stroke="#174b35"
                    strokeWidth="2"
                    className="ward-pulse-circle"
                  />
                )}

                {/* Pin marker base */}
                <circle
                  cx={w.cx}
                  cy={w.cy}
                  r={isSelected ? 16 : 13}
                  fill={isSelected ? '#174b35' : '#ffffff'}
                  stroke={isSelected ? '#f4d875' : '#6b937c'}
                  strokeWidth={isSelected ? '3' : '2'}
                  filter="url(#pinShadow)"
                  style={{ transition: 'all 0.25s ease' }}
                />

                {/* Marker icon/dot */}
                <circle
                  cx={w.cx}
                  cy={w.cy}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? '#f4d875' : '#ce735c'}
                />

                {/* Ward Name Label */}
                <text
                  x={w.cx}
                  y={w.cy + (w.cy > 320 ? -20 : 26)}
                  textAnchor="middle"
                  fill="#193129"
                  fontSize={isSelected ? '12' : '11'}
                  fontWeight={isSelected ? '700' : '500'}
                  className="ward-svg-text"
                >
                  {w.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Responsive Floating Ward Info Sheet / Card */}
        <div className="ward-active-info-panel">
          <div className="ward-info-header">
            <div>
              <span className="muted-label">ACTIVE LOCALITY</span>
              <h4>{activeWard.name}, Pune</h4>
            </div>
            <span className="ward-badge">
              <span className="status-dot" /> Live PMC Data
            </span>
          </div>

          <div className="ward-stats-row">
            <div className="ward-stat-item">
              <span className="stat-num">{activeWard.issues}</span>
              <span className="stat-desc">Total Reports</span>
            </div>
            <div className="ward-stat-item open-stat">
              <span className="stat-num text-amber">{activeWard.open}</span>
              <span className="stat-desc">In Progress</span>
            </div>
            <div className="ward-stat-item res-stat">
              <span className="stat-num text-green">{activeWard.resolved}</span>
              <span className="stat-desc">Resolved</span>
            </div>
          </div>

          <div className="ward-footer-row">
            <div className="ward-topic">
              <Clock size={13} />
              <span>Top concern: <b>{activeWard.dominant}</b></span>
            </div>
            {isPicker && (
              <button
                type="button"
                className="outline-button small-button use-locality-btn"
                onClick={() => handleSelect(activeWard)}
              >
                Use this area
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
