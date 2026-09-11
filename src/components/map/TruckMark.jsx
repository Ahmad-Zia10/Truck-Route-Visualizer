import { forwardRef } from 'react';

/**
 * The vehicle.
 *
 * The outer <g> is positioned and rotated by the animation loop via
 * setAttribute('transform', ...), so it must stay an empty, untransformed
 * wrapper that forwards its ref — all artwork lives in the inner group and is
 * drawn around (0,0).
 *
 * A disc sits under the vehicle so the truck stays findable against any ground
 * plate, and so rotation reads as heading rather than as the shape tumbling.
 */
const TruckMark = forwardRef(function TruckMark(_props, ref) {
  return (
    <g ref={ref}>
      {/* Halo + disc: counter-rotated content is unnecessary here because both
          are radially symmetric. */}
      <circle r="17" fill="var(--accent)" opacity="0.16" />
      <circle
        r="11.5"
        fill="var(--panel)"
        stroke="var(--truck)"
        strokeWidth="2"
      />

      {/* Vehicle silhouette, nose pointing +x to match the heading angle. */}
      <g transform="translate(-7.5, -4.5) scale(0.62)" fill="var(--truck)">
        <rect width="17" height="13" rx="2.5" />
        <rect x="16" y="3.5" width="9.5" height="9.5" rx="2" />
        <circle cx="5" cy="14.5" r="3" />
        <circle cx="20" cy="14.5" r="3" />
      </g>
    </g>
  );
});

export default TruckMark;
