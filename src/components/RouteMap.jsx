import { useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  STOPS,
  SEGMENTS,
  BASE_SPEED,
  DWELL_SECONDS,
} from '../features/route/routeData';
import {
  geometryMeasured,
  distanceAdvanced,
  arrivedAtStop,
  deliveryFinished,
} from '../features/route/routeSlice';
import {
  selectStatus,
  selectIsPaused,
  selectSpeed,
  selectCompletedCount,
  selectGeometry,
  selectStopStates,
} from '../features/route/selectors';

const ORIGIN = STOPS[0];

export default function RouteMap() {
  const dispatch = useDispatch();

  const status = useSelector(selectStatus);
  const isPaused = useSelector(selectIsPaused);
  const speed = useSelector(selectSpeed);
  const completedCount = useSelector(selectCompletedCount);
  const geometry = useSelector(selectGeometry);
  const stopStates = useSelector(selectStopStates);

  const pathRefs = useRef([]);
  const trailRefs = useRef([]);
  const truckRef = useRef(null);

  // Live animation values
  const distanceRef = useRef(0);
  const elapsedRef = useRef(0);
  const dwellRef = useRef(0);
  const lastTsRef = useRef(null);
  const throttleRef = useRef(0);
 
  useEffect(() => {
    const segmentLengths = pathRefs.current.map((p) => p.getTotalLength());
    const stopDistances = segmentLengths.reduce((acc, len) => {
      acc.push((acc.at(-1) ?? 0) + len);
      return acc;
    }, []);
    dispatch(
      geometryMeasured({
        segmentLengths,
        stopDistances,
        total: stopDistances.at(-1),
      }),
    );
  }, [dispatch]);

  // paint the trail
  const paint = useCallback(() => {
    const { segmentLengths, stopDistances } = geometry;
    if (!segmentLengths.length || !truckRef.current) return;

    const d = distanceRef.current;

    // Which leg are we on?
    let i = 0;
    while (i < segmentLengths.length - 1 && d >= stopDistances[i]) i += 1;

    const segStart = i === 0 ? 0 : stopDistances[i - 1];
    const local = Math.max(0, Math.min(d - segStart, segmentLengths[i]));
    const path = pathRefs.current[i];

    // Position the truck at the right point along the path, and rotate it to face the direction of travel.
    const p = path.getPointAtLength(local);
    const ahead = path.getPointAtLength(Math.min(local + 5, segmentLengths[i]));
    const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;

    truckRef.current.setAttribute(
      'transform',
      `translate(${p.x} ${p.y}) rotate(${angle})`,
    );

    trailRefs.current.forEach((el, j) => {
      if (!el) return;
      const start = j === 0 ? 0 : stopDistances[j - 1];
      const covered = Math.max(0, Math.min(d - start, segmentLengths[j]));
      el.style.strokeDasharray = segmentLengths[j];
      el.style.strokeDashoffset = segmentLengths[j] - covered;
    });
  }, [geometry]);

  useEffect(() => {
    if (!geometry.measured) return;
    if (status === 'idle') {
      distanceRef.current = 0;
      elapsedRef.current = 0;
      dwellRef.current = 0;
    }
    paint();
  }, [status, completedCount, geometry.measured, paint]);


  // The animation loop

  useEffect(() => {
    if (!geometry.measured) return;
    if (status === 'idle' || status === 'complete') return;
    if (isPaused) {
      // Stop the animation loop and reset the timestamp.
      lastTsRef.current = null;
      return;
    }

    let raf;
    const tick = (ts) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;

      // Clamp dt - backgrounded tab doesn't teleport the truck.
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.1);
      lastTsRef.current = ts;
      elapsedRef.current += dt;

      if (status === 'moving') {
        const target = geometry.stopDistances[completedCount];
        distanceRef.current += BASE_SPEED * speed * dt;

        if (distanceRef.current >= target) {
          distanceRef.current = target;
          paint();
          dispatch(arrivedAtStop());
          return; 
        }

        paint();

        if (ts - throttleRef.current > 100) {
          throttleRef.current = ts;
          dispatch(
            distanceAdvanced({
              distance: distanceRef.current,
              elapsed: elapsedRef.current,
            }),
          );
        }
      } else if (status === 'delivering') {
        dwellRef.current += dt * speed;
        if (dwellRef.current >= DWELL_SECONDS) {
          dwellRef.current = 0;
          dispatch(deliveryFinished());
          return;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lastTsRef.current = null;
    };
  }, [
    status,
    isPaused,
    speed,
    completedCount,
    geometry.measured,
    geometry.stopDistances,
    paint,
    dispatch,
  ]);

  const pinFill = (state) =>
    state === 'delivered'
      ? 'var(--pin-done)'
      : state === 'delivering'
        ? 'var(--pin-active)'
        : 'var(--pin-pending)';

  return (
    <svg
      viewBox="0 0 800 500"
      className="block w-full"
      role="img"
      aria-label="Delivery route map showing the truck's position between the depot and three delivery points"
    >
      <defs>
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <path
            d="M 100 0 L 0 0 0 100"
            fill="none"
            stroke="var(--grid)"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect width="800" height="500" fill="var(--map-bg)" />
      <rect width="800" height="500" fill="url(#grid)" />

      {/* Planned route — dashed, muted */}
      {SEGMENTS.map((seg, i) => (
        <path
          key={`plan-${seg.from}-${seg.to}`}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
          d={seg.d}
          fill="none"
          stroke="var(--route)"
          strokeWidth="2.5"
          strokeDasharray="9 7"
          strokeLinecap="round"
        />
      ))}

      {/* Covered route — solid, drawn on top and revealed as the truck moves */}
      {SEGMENTS.map((seg, i) => (
        <path
          key={`trail-${seg.from}-${seg.to}`}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          d={seg.d}
          fill="none"
          stroke="var(--trail)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      ))}

      {/* Depot */}
      <circle
        cx={ORIGIN.x}
        cy={ORIGIN.y}
        r="8"
        fill="var(--panel)"
        stroke="var(--trail)"
        strokeWidth="4"
      />
      <text
        x={ORIGIN.x}
        y={ORIGIN.y + 28}
        textAnchor="middle"
        fill="var(--text-soft)"
        fontSize="14"
        fontWeight="600"
      >
        Depot
      </text>

      {/* Delivery pins */}
      {stopStates.map((stop) => (
        <g key={stop.id}>
          <path
            d={`M ${stop.x} ${stop.y} c -12 -13 -12 -29 0 -29 c 12 0 12 16 0 29 z`}
            fill={pinFill(stop.state)}
            style={{ transition: 'fill 400ms ease' }}
          />
          {stop.state === 'delivered' ? (
            <path
              d={`M ${stop.x - 5} ${stop.y - 20} l 3.5 3.5 l 6 -7`}
              fill="none"
              stroke="var(--panel)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <circle cx={stop.x} cy={stop.y - 19} r="4.5" fill="var(--map-bg)" />
          )}
          <text
            x={stop.x}
            y={stop.y - 38}
            textAnchor="middle"
            fill="var(--text-soft)"
            fontSize="14"
            fontWeight="600"
          >
            {stop.label}
          </text>
        </g>
      ))}

      {/* Truck — drawn around (0,0) so the group transform can rotate it */}
      <g ref={truckRef}>
        <g transform="translate(-13, -8)">
          <rect width="18" height="13" rx="2.5" fill="var(--truck)" />
          <rect x="17" y="3.5" width="9" height="9.5" rx="2" fill="var(--truck)" />
          <circle cx="5" cy="14" r="3" fill="var(--truck)" />
          <circle cx="20" cy="14" r="3" fill="var(--truck)" />
        </g>
      </g>
    </svg>
  );
}