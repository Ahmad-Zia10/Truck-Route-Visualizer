/**
 * The origin. Deliberately not a pin: the depot is a place the route starts
 * from, not a delivery to complete, and giving it the pin shape would imply a
 * fourth stop. A surveyor's square marker reads as an anchor instead.
 */
export default function DepotMark({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <ellipse cx="0" cy="1.5" rx="7" ry="2.4" fill="var(--truck)" opacity="0.18" />

      <rect
        x="-9"
        y="-9"
        width="18"
        height="18"
        rx="3"
        transform="rotate(45)"
        fill="var(--panel)"
        stroke="var(--trail)"
        strokeWidth="3"
      />
      <circle cx="0" cy="0" r="3.2" fill="var(--trail)" />

      <g transform="translate(0 26)">
        <rect
          x="-27"
          y="-11"
          width="54"
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
          fontSize="11"
          fontWeight="700"
          letterSpacing="1.1"
        >
          DEPOT
        </text>
      </g>
    </g>
  );
}
