/**
 * The ground the route is drawn on.
 *
 * Deliberately almost nothing: a flat plate and a sparse grid. Visual structure
 * on a map should encode information, and invented coastlines, streets and
 * waterways encode none — they only compete with the one thing the map exists
 * to show. The grid stays because it gives a sense of scale without pretending
 * to be geography.
 *
 * Purely presentational, so the layer is aria-hidden.
 */
export default function MapGround() {
  return (
    <g aria-hidden="true">
      <rect width="800" height="500" fill="var(--map-bg)" />

      <g stroke="var(--grid)" strokeWidth="1">
        <path d="M 160 0 V 500 M 320 0 V 500 M 480 0 V 500 M 640 0 V 500" />
        <path d="M 0 125 H 800 M 0 250 H 800 M 0 375 H 800" />
      </g>
    </g>
  );
}
