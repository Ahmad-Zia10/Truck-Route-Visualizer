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

      {/* Set on the map itself. The stroke is drawn behind the glyphs, which
          gives a halo that stays legible over the grid without a container. */}
      <text
        y="30"
        textAnchor="middle"
        fill="var(--text)"
        stroke="var(--map-bg)"
        strokeWidth="4"
        paintOrder="stroke"
        fontSize="14"
        fontWeight="600"
      >
        Depot
      </text>
    </g>
  );
}
