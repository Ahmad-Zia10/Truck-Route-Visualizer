// Canvas is 800x500.
export const STOPS = [
  { id: 'origin', label: 'Origin', name: 'Depot', x: 110, y: 425 },
  { id: 'D1', label: 'D1', name: 'Nadesar Market', x: 320, y: 250 },
  { id: 'D2', label: 'D2', name: 'Sigra Warehouse', x: 495, y: 315 },
  { id: 'D3', label: 'D3', name: 'Lanka Depot', x: 700, y: 155 },
];


// The control point is a magnet the curve bends toward but never reaches.
export const SEGMENTS = [
  { from: 'origin', to: 'D1', d: 'M 110 425 Q 175 320 320 250' },
  { from: 'D1', to: 'D2', d: 'M 320 250 Q 415 210 495 315' },
  { from: 'D2', to: 'D3', d: 'M 495 315 Q 630 400 700 155' },
];

// Scale factor turning SVG units into kilometres 
export const KM_PER_UNIT = 0.021;

// Base travel speed in SVG units per second.
export const BASE_SPEED = 12;

// Seconds the truck dwells at each stop while "delivering".
export const DWELL_SECONDS = 2;

export const SPEED_OPTIONS = [1, 2, 4];