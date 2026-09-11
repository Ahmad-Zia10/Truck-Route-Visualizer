<div align="center">

# 🚚 Truck Route Visualizer

> A dispatch screen for a single delivery run — where the truck is, when it arrives, and what has been delivered.

<br/>

![React](https://img.shields.io/badge/React-19-087ea4?style=for-the-badge&logo=react&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764abc?style=for-the-badge&logo=redux&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-0ea5e9?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646cff?style=for-the-badge&logo=vite&logoColor=white)

<br/>

🔗 **[Live Demo](https://truck-route-visualizer-ashy.vercel.app/)** &nbsp;·&nbsp; 📂 **[Source](https://github.com/Ahmad-Zia10/Truck-Route-Visualizer)** &nbsp;·&nbsp;

</div>

---

<div align="center">

<!-- Record a ~10s clip of a full route at 4x, save as docs/demo.gif -->
![Route simulation](docs/demo.gif)

<sub>A full route at 4× speed — depot → D1 → D2 → D3</sub>

</div>

---

## What is this?

A dispatcher watching a delivery truck needs three answers, at a glance, without
hunting: **where is it right now**, **has a given drop been made**, and **when
does it reach the next one**. This screen answers those three and nothing else.

The truck follows a fixed route from a depot through three drops, pausing at each
to unload. The map and the status panel are two readings of the same underlying
number, so they cannot disagree — which matters, because a dispatcher who spots
one contradiction stops trusting the whole display.

Built as a frontend interview assignment, which is why a simulation speed control
exists: a real dispatcher would never fast-forward a truck, but a reviewer needs
to see a full route in fifteen seconds rather than a minute.

---

## ✨ Features

- 🛻 &nbsp;Animated truck following curved route segments, rotating to face its heading
- 📊 &nbsp;Live readouts — next stop, ETA, distance covered, route length
- 📍 &nbsp;Three delivery states shown identically on the map and in the manifest
- ⏸️ &nbsp;Pause and resume mid-route, including mid-unload, without losing position
- ⏩ &nbsp;Speed control (1× / 2× / 4×) for reviewing a full route quickly
- 🌗 &nbsp;Light and dark themes, following system preference
- 📱 &nbsp;Responsive from 375px

---

## 🚀 Running locally

Requires Node 18 or later. Built on Node 22.

```bash
git clone https://github.com/Ahmad-Zia10/Truck-Route-Visualizer.git
cd Truck-Route-Visualizer
npm install
npm run dev
```

Dev server runs at `http://localhost:5173`. Also available: `npm run build`,
`npm run preview`, `npm run lint`.

---

## ⚙️ How it works

The route is three quadratic Bézier segments. On mount, each is measured with
`getTotalLength()`, giving the segment lengths, the cumulative distance to every
stop, and the route total.

From there the whole app runs on **one number: distance travelled from the
depot.** Truck position, current leg, next stop, ETA, the covered portion of the
route, every readout — all computed from it. Nothing derivable is stored, so the
map and the panel cannot drift apart.

Motion runs in a `requestAnimationFrame` loop. Each frame advances the distance,
calls `getPointAtLength()` for the position, and samples slightly ahead for the
heading angle. Frame deltas are clamped at 100ms so a backgrounded tab does not
teleport the truck on return.

A run moves through four states — `idle`, `moving`, `delivering`, `complete` —
with `isPaused` sitting orthogonal to all four. That separation is what lets a
paused unload resume *as an unload*: were pause a fifth state value, it would
overwrite the one it interrupted and leave nothing to return to.

---

## 🧭 Key decisions

### 🗺️ An SVG map, not Leaflet

The brief asks for an origin, three delivery points and a route path — not for
real geography. Inline SVG gives direct control over the animation with no API
key, no tile loading, and nothing to work around in a mapping library's own
render cycle.

> **Trade-off** — this isn't real geography, and map integration was a listed
> skill. `routeData.js` is the seam: coordinates and paths in a shape that maps
> onto lat/lng, so swapping in Leaflet changes that file and the renderer while
> the state layer stays put.

### 📐 Three route segments, not one continuous path

Both animate identically. They differ on the question the app asks constantly:
**how far along the route is D1?**

With three segments, D1's distance *is* the length of the first segment. It falls
out of the measurement, and every stop lands on a boundary by construction.

With one merged path, you know the route is 795 units long and you know where D1
sits — but the path doesn't know those facts are related. You'd walk the curve
searching for the nearest point: approximate, and only necessary because merging
threw the boundaries away.

> **Trade-off** — about eight extra lines to work out which leg is partially
> covered when drawing the covered route.

### 🔢 Completed deliveries are stored, not derived

Almost everything here is derived. This is the deliberate exception.

Counting deliveries *looks* derivable — count the stops the truck has passed. It
breaks at the last one. When the final delivery finishes, the truck doesn't move;
it's at D3 before and after. Position can't tell "unloading at D3" from "route
complete", so a derived count would need a special case bolted on for the final
stop.

A delivery finishing is an event in time, not a position. It belongs alongside
`status`, which exists for the same reason: distance answers *where*, never *what
is happening*.

### ⚡ The loop caches per frame, dispatches at 10Hz

The store stays the source of truth. The loop keeps a per-frame cache, re-seeded
from the store whenever it restarts, and dispatches back roughly ten times a
second instead of sixty — because nobody reads a two-decimal number sixty times a
second.

> **Trade-off** — position briefly lives in two places. That matters at exactly
> one moment: pausing, where the truck is painted at frame precision while the
> store can be 100ms behind. So pause flushes the exact frame position before
> stopping, closing the gap at the only point it would show.

---

## 📁 Project structure

```
src/
├── components/
│   ├── RouteMap.jsx         Map surface, geometry measurement, animation loop
│   ├── StatusPanel.jsx      Status line, readouts, delivery manifest
│   ├── Controls.jsx         Start/pause, reset, speed
│   └── map/                 Ground, depot, stop pins, truck
├── features/route/
│   ├── routeData.js         Stops, segment paths, speed and scale constants
│   ├── routeSlice.js        State shape and reducers
│   └── selectors.js         Derived values — ETA, progress, per-stop state
├── hooks/
│   └── useReducedMotion.js  Tracks the reduced-motion preference
└── index.css                Design tokens and base styles
```

Components are split by **how often they change**, not by what they look like.
`RouteMap` owns everything updating per frame, `StatusPanel` everything updating
at milestones, `Controls` everything changing on user action.

---

## ⚠️ Known limitations

- Not real geography — the map is a stylised canvas, not tiles
- One hard-coded route; `routeData.js` is data-shaped, so a fourth stop is one
  entry per array, but there's no route picker
- No persistence — a refresh returns the truck to the depot
- ETA reports simulated time and is unaffected by the speed control, which is why
  the readout is labelled as such

## 🔭 With more time

- Unit tests on the distance-to-position mapping and the stop-arrival boundary —
  the two places a subtle bug could hide
- Multiple trucks, which the state shape handles by keying the run fields per
  vehicle
- Real tiles behind the same `routeData.js` interface

---

## 🛠️ Tech stack

**React 19** · **Redux Toolkit** · **Tailwind CSS 4** over CSS custom properties ·
**Vite** · **SVG** for map and path geometry

Typeface is Barlow, with Barlow Semi Condensed for map lettering.

Deployed on **Vercel** from `main` — Vite preset detected automatically, no
configuration and no environment variables needed.
