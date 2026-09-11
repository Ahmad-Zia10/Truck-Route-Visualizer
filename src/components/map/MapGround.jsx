/**
 * The ground the route is drawn on.
 *
 * Varanasi sits on the west bank of the Ganges, which runs roughly north-south
 * and bends west as it goes. The depot is south-west, the three drops run
 * north-east through the city, so the river belongs on the eastern edge with
 * the built-up quarter between it and the route.
 *
 * Everything here is exact vector geometry — plates, casings, graticule — in the
 * manner of a printed chart. No noise filters, no imitation of a photograph:
 * shapes a session can specify precisely, which is what keeps this reading as
 * cartography rather than decoration.
 *
 * The ground is background. It is drawn quiet on purpose: the route, the stops
 * and the truck are the message, and anything here that competes with them is a
 * defect. Purely decorative, so the layer is aria-hidden.
 */
export default function MapGround() {
  return (
    <g aria-hidden="true">
      {/* Base land plate */}
      <rect width="800" height="500" fill="var(--map-bg)" />

      {/* Built-up quarter — a second land tone, its edges following the
          arterials so it reads as a district with streets, not a slab. */}
      <path
        d="M 232 118 C 340 78, 470 62, 606 76 C 628 160, 640 246, 622 322
           C 512 356, 396 356, 296 318 C 250 264, 228 190, 232 118 Z"
        fill="var(--map-land-alt)"
      />

      {/* Parkland, anchored to the district edge and the riverbank rather than
          floating in open ground. */}
      <path
        d="M 74 214 C 118 186, 176 182, 214 206 C 222 250, 204 288, 166 302
           C 118 300, 80 264, 74 214 Z"
        fill="var(--map-park)"
      />
      <path
        d="M 548 392 C 596 378, 636 384, 656 404 C 650 440, 618 462, 574 460
           C 546 440, 540 414, 548 392 Z"
        fill="var(--map-park)"
      />

      {/* The river: a wide band down the eastern edge. Kept inside the frame so
          the far bank is visible and it reads as a river, not a cut edge. */}
      <path
        d="M 726 -30 C 700 110, 762 232, 712 356 C 684 430, 700 486, 690 530"
        fill="none"
        stroke="var(--map-water)"
        strokeWidth="78"
        strokeLinecap="butt"
      />
      {/* Sandbank inside the bend — the detail that makes it read as a real
          waterway rather than a blue stripe. */}
      <path
        d="M 724 236 C 742 268, 738 300, 720 326 C 712 298, 714 264, 724 236 Z"
        fill="var(--map-bg)"
        opacity="0.55"
      />

      {/* Graticule — survey grid, not graph paper: sparse and faint. */}
      <g stroke="var(--map-graticule)" strokeWidth="1">
        <path d="M 160 0 V 500 M 320 0 V 500 M 480 0 V 500 M 640 0 V 500" />
        <path d="M 0 125 H 800 M 0 250 H 800 M 0 375 H 800" />
      </g>

      {/* Road network. Each road is a casing under a fill, which is how printed
          maps give roads weight — but both tones sit close to the land so the
          network reads as texture the route crosses, never as the subject. */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g stroke="var(--map-road-case)" strokeWidth="8">
          <path d="M 40 470 C 170 440, 246 344, 326 262 C 418 172, 520 140, 664 130" />
          <path d="M 128 30 C 206 146, 302 248, 424 300 C 542 350, 632 332, 700 260" />
        </g>
        <g stroke="var(--map-road)" strokeWidth="5">
          <path d="M 40 470 C 170 440, 246 344, 326 262 C 418 172, 520 140, 664 130" />
          <path d="M 128 30 C 206 146, 302 248, 424 300 C 542 350, 632 332, 700 260" />
        </g>

        {/* Secondary streets, thinner still. */}
        <g stroke="var(--map-road)" strokeWidth="2.5" opacity="0.85">
          <path d="M 214 500 C 252 420, 270 340, 300 254" />
          <path d="M 470 44 C 486 132, 498 220, 494 314" />
          <path d="M 100 306 C 202 298, 300 306, 392 334" />
          <path d="M 596 424 C 634 352, 656 264, 660 176" />
          <path d="M 262 168 C 346 150, 440 142, 540 150" />
        </g>
      </g>

      {/* River label, set along the bank the way a chart names its water. */}
      <text
        transform="translate(742 148) rotate(84)"
        textAnchor="middle"
        fill="var(--text-soft)"
        fontSize="11"
        letterSpacing="3.5"
        opacity="0.8"
      >
        GANGA
      </text>
    </g>
  );
}
