import { forwardRef } from 'react';

/**
 * The vehicle.
 *
 * The outer <g> is positioned and rotated by the animation loop via
 * setAttribute('transform', ...), so it must stay an empty, untransformed
 * wrapper that forwards its ref — all artwork lives in the inner group and is
 * drawn around (0,0).
 *
 * The silhouette carries a map-coloured halo rather than sitting inside a disc:
 * at rest a disc reads as a dark smudge and hides the shape that communicates
 * heading.
 */
const TruckMark = forwardRef(function TruckMark(_props, ref) {
  return (
    <g ref={ref}>
      {/* Vehicle silhouette, nose pointing +x to match the heading angle. The
          stroke is drawn behind the fill, so the halo separates the truck from
          the route line underneath without enclosing it. */}
      <g
        transform="translate(-9, -5.5) scale(0.74)"
        fill="var(--truck)"
        stroke="var(--map-bg)"
        strokeWidth="3"
        paintOrder="stroke"
      >
        <rect width="17" height="13" rx="2.5" />
        <rect x="16" y="3.5" width="9.5" height="9.5" rx="2" />
        <circle cx="5" cy="14.5" r="3" />
        <circle cx="20" cy="14.5" r="3" />
      </g>
    </g>
  );
});

export default TruckMark;
