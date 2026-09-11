/**
 * A delivery stop on the map.
 *
 * The three states have to separate at a glance, so each differs in shape and
 * fill, never in colour alone:
 *
 *   pending    hollow pin, muted, small dot core
 *   unloading  filled pin, amber, ring around it, open core
 *   delivered  filled pin, green, check glyph
 *
 * Drawn around (0,0) and positioned by transform, so the geometry stays
 * readable and the label offsets are constant.
 */

const FILL = {
  pending: 'var(--map-bg)',
  delivering: 'var(--pin-active)',
  delivered: 'var(--pin-done)',
};

const STROKE = {
  pending: 'var(--pin-pending)',
  delivering: 'var(--pin-active)',
  delivered: 'var(--pin-done)',
};

// A teardrop: circular head, tapering to a point at the anchor.
const PIN_PATH =
  'M 0 0 C -7.5 -11, -13 -17.5, -13 -25 A 13 13 0 1 1 13 -25 C 13 -17.5, 7.5 -11, 0 0 Z';

export default function StopPin({ stop, transition }) {
  const { state, label } = stop;

  return (
    <g transform={`translate(${stop.x} ${stop.y})`}>
      {/* Ground shadow — an ellipse at the anchor, so the pin sits on the map
          rather than floating over it. */}
      <ellipse cx="0" cy="1.5" rx="6" ry="2.2" fill="var(--truck)" opacity="0.18" />

      {/* Active ring: only the stop being served carries it, which makes the
          live stop findable without reading a single word. */}
      {state === 'delivering' && (
        <circle
          cx="0"
          cy="-25"
          r="20"
          fill="none"
          stroke="var(--pin-active)"
          strokeWidth="2"
          opacity="0.45"
        />
      )}

      <path
        d={PIN_PATH}
        fill={FILL[state]}
        stroke={STROKE[state]}
        strokeWidth="2.5"
        strokeLinejoin="round"
        style={{ transition }}
      />

      {state === 'delivered' ? (
        <path
          d="M -5.5 -25.5 l 4 4 l 7 -8"
          fill="none"
          stroke="var(--panel)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : state === 'delivering' ? (
        <circle cx="0" cy="-25" r="4.5" fill="var(--map-bg)" />
      ) : (
        <circle cx="0" cy="-25" r="3.5" fill="var(--pin-pending)" />
      )}

      {/* Label plate: the stop code on a solid chip, so it stays legible
          wherever the pin lands — over land, water or a road. */}
      <g transform="translate(0 -46)">
        <rect
          x="-15"
          y="-11"
          width="30"
          height="19"
          rx="4"
          fill="var(--panel)"
          stroke="var(--line)"
          strokeWidth="1"
        />
        <text
          textAnchor="middle"
          y="3"
          fill="var(--text)"
          fontSize="12"
          fontWeight="700"
          letterSpacing="0.3"
        >
          {label}
        </text>
      </g>
    </g>
  );
}
