# Truck Route Visualizer

A delivery route simulator for a single dispatch run. A truck drives a fixed route from a depot through three drops, and the screen answers three questions at any moment: where the truck is, when it reaches the next stop, and what has been delivered.

**[Live demo →](https://truck-route-visualizer-ashy.vercel.app/)**

<!-- Screenshot: capture the wide layout at ~1400px and save it to docs/screenshot.png,
     then uncomment the line below.
![The dispatch screen showing the route map and status panel](docs/screenshot.png)
-->


## Contents

- [Features](#features)
- [Running locally](#running-locally)
- [How it works](#how-it-works)
- [Project structure](#project-structure)
- [Design decisions](#design-decisions)
- [Accessibility](#accessibility)
- [Deployment](#deployment)
- [Tech stack](#tech-stack)

## Features

- Animated truck that follows curved route segments and rotates to face its heading
- Live readouts for completed drops, next stop, ETA, distance covered and total route length
- Per-stop delivery states — pending, unloading, delivered — shown on both the map and the manifest
- Pause and resume mid-route, including mid-unload, without losing position
- Simulation speed control (1×, 2×, 4×) so a full route can be reviewed in around fifteen seconds
- Light and dark themes, following the system preference by default
- Responsive from 375px upward

## Running locally

Requires Node.js 18 or later. Built and tested on Node 22.

```bash
git clone https://github.com/Ahmad-Zia10/Truck-Route-Visualizer.git
cd Truck-Route-Visualizer
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server with hot module replacement |
| `npm run build` | Produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## How it works

The route is three quadratic Bézier segments defined in `src/features/route/routeData.js`. On mount, `RouteMap` measures each segment with `getTotalLength()` and stores the lengths, the cumulative distance to each stop, and the route total in Redux. Every distance in the app derives from those measurements, so the map and the numbers cannot disagree.

Motion runs in a `requestAnimationFrame` loop. Each frame advances a distance counter, calls `getPointAtLength()` to find the truck's position, and samples a point slightly ahead to compute the heading angle. The frame delta is clamped to 100ms so a backgrounded tab does not teleport the truck on return.

The loop keeps a per-frame cache of distance, elapsed time and dwell, then dispatches to Redux at roughly 10Hz rather than every frame. Without the throttle, a store update per frame would re-render the panel 60 times a second to change a two-decimal readout. The store stays the source of truth: the cache is re-seeded from it whenever the loop restarts, which is what lets a pause, a remount or a reset resume from the exact stored position.

A run moves through five states — `idle`, `moving`, `delivering`, `complete`, and a paused flag orthogonal to those. Arriving at a stop switches to `delivering` and starts a dwell timer; when the dwell completes, the stop is marked delivered and the truck moves on.

## Project structure

```
src/
├── components/
│   ├── RouteMap.jsx         Map surface, geometry measurement, animation loop
│   ├── StatusPanel.jsx      Status line, readouts, delivery manifest
│   ├── Controls.jsx         Start/pause, reset, speed selection
│   └── map/
│       ├── MapGround.jsx    Ground plate and grid
│       ├── DepotMark.jsx    Route origin
│       ├── StopPin.jsx      Delivery stop in one of three states
│       └── TruckMark.jsx    Vehicle silhouette
├── features/route/
│   ├── routeData.js         Stops, segment paths, speed and scale constants
│   ├── routeSlice.js        State shape and reducers
│   └── selectors.js         Derived values — ETA, progress, per-stop state
├── hooks/
│   └── useReducedMotion.js  Tracks the reduced-motion preference
└── index.css                Design tokens and base styles
```

## Design decisions

**Colour carries meaning, separately from chrome.** Three delivery states each own a fixed hue — grey for pending, orange for unloading, green for delivered — and those hues appear identically on the map pins and in the manifest, so the two readings of the route agree. The interface accent is blue and drives only buttons, focus rings and selection. Because the two are independent, restyling the chrome can never change what a colour on the map means.

**The map shows only what it can justify.** Earlier iterations had invented roads, parkland and a river. None encoded anything, and the road lines in particular were higher contrast than the route itself, pulling the eye away from the one thing the map exists to show. They were removed. What remains is a faint grid for scale, and each leg's distance printed at its midpoint — so the map itself answers "how far is the next leg" rather than leaving the panel to carry it.

**Panel hierarchy follows reading order.** Top to bottom: what is happening now, then the numbers, then what has been delivered. The delivery manifest is the visual centre, since it answers one of the screen's three questions and the status line is self-describing at body size.

**Map labels use a stroke halo rather than a container.** Setting `paint-order: stroke` draws an outline behind the glyphs, keeping text legible over the grid without four identical pill-shaped boxes competing with the pins.

**Two accent values.** A colour bright enough to work as a fill on a large shape usually fails the 4.5:1 text threshold. Rather than compromise the fill or fail the text, the accent role splits: `--accent` for fills, `--accent-ink` — the same hue, darkened — wherever it carries text.

## Accessibility

- All text meets WCAG AA contrast in both themes; map pins clear the 3:1 threshold for non-text content, verified by calculation rather than by eye
- Delivery states differ in shape and fill, not colour alone — pending pins are hollow, unloading pins carry a ring, delivered pins carry a check
- Status changes are announced through a polite live region, derived only from discrete state so the ~10Hz distance updates never trigger repeat announcements
- The primary and reset controls meet the 44px touch-target minimum; the speed buttons are 36px tall and 44px wide, sized to sit as a grouped segmented control
- The reduced-motion preference is handled in JavaScript rather than with a blanket CSS override, so the pin colour transition that signals a state change is preserved while decorative motion stops
- Keyboard focus is visible throughout

## Deployment

Deployed on Vercel from the `main` branch. Vercel detects the Vite preset automatically; no configuration file is required.

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

No environment variables are needed — the app has no backend.

## Tech stack

| | |
| --- | --- |
| **React 19** | UI |
| **Redux Toolkit** | State, with derived values in memoized selectors |
| **Tailwind CSS 4** | Styling, over CSS custom properties for theming |
| **Vite** | Build tooling |
| **SVG** | Map rendering and path geometry |

Typeface is [Barlow](https://fonts.google.com/specimen/Barlow), with Barlow Semi Condensed for map lettering.
