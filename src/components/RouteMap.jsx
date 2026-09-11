import { useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useReducedMotion } from '../hooks/useReducedMotion';
import MapGround from './map/MapGround';
import DepotMark from './map/DepotMark';
import StopPin from './map/StopPin';
import TruckMark from './map/TruckMark';
import {
  STOPS,
  SEGMENTS,
  BASE_SPEED,
  DWELL_SECONDS,
} from '../features/route/routeData';
import {
  geometryMeasured,
  distanceAdvanced,
  dwellAdvanced,
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
  selectDistance,
  selectDwell,
  selectElapsed,
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
  const distance = useSelector(selectDistance);
  const dwell = useSelector(selectDwell);
  const elapsed = useSelector(selectElapsed);

  const pathRefs = useRef([]);
  const trailRefs = useRef([]);
  const truckRef = useRef(null);

  // Per-frame cache of the values the store owns. The store is the source of
  // truth; these exist so a frame can advance without waiting on a dispatch,
  // and they are re-seeded from the store whenever the loop (re)starts.
  const distanceRef = useRef(distance);
  const elapsedRef = useRef(elapsed);
  const dwellRef = useRef(dwell);
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

  // Re-seed the frame cache from the store and repaint. On mount this restores
  // the truck to wherever the route actually is; on reset it returns to zero.
  useEffect(() => {
    if (!geometry.measured) return;
    distanceRef.current = distance;
    elapsedRef.current = elapsed;
    dwellRef.current = dwell;
    paint();
    // `distance` is intentionally excluded: the loop advances the cache every
    // frame and dispatches a throttled copy back, so following it here would
    // fight the animation. Mount, reset, and stop transitions are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, completedCount, isPaused, geometry.measured, paint]);


  // The animation loop

  useEffect(() => {
    if (!geometry.measured) return;
    if (status === 'idle' || status === 'complete') return;
    if (isPaused) {
      // Stop the loop and flush the exact frame position into the store, so the
      // paused readout matches the pixel the truck is parked on.
      lastTsRef.current = null;
      dispatch(
        status === 'delivering'
          ? dwellAdvanced({
              dwell: dwellRef.current,
              elapsed: elapsedRef.current,
            })
          : distanceAdvanced({
              distance: distanceRef.current,
              elapsed: elapsedRef.current,
            }),
      );
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

        if (ts - throttleRef.current > 100) {
          throttleRef.current = ts;
          dispatch(
            dwellAdvanced({
              dwell: dwellRef.current,
              elapsed: elapsedRef.current,
            }),
          );
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

  // Reduced motion: the truck still advances, but pin colour changes snap
  // instead of cross-fading, so state changes stay legible without animation.
  const pinTransition = useReducedMotion() ? undefined : 'fill 400ms ease';

  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid meet"
      className="block h-full w-full"
      role="img"
      aria-label="Delivery route map showing the truck's position between the depot and three delivery points"
    >
      <MapGround />

      {/* Planned route — the leg still to drive. Drawn as a cased dashed line so
          it reads as a marked-up intention over the map, not as another road. */}
      {SEGMENTS.map((seg) => (
        <path
          key={`plan-case-${seg.from}-${seg.to}`}
          d={seg.d}
          fill="none"
          stroke="var(--map-bg)"
          strokeWidth="9"
          strokeLinecap="round"
          opacity="0.85"
        />
      ))}
      {SEGMENTS.map((seg, i) => (
        <path
          key={`plan-${seg.from}-${seg.to}`}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
          d={seg.d}
          fill="none"
          stroke="var(--route)"
          strokeWidth="3"
          strokeDasharray="2 10"
          strokeLinecap="round"
        />
      ))}

      {/* Covered route — solid and confident, revealed as the truck advances.
          The casing is static; only the coloured trail on top is masked back by
          the loop, so the corridor stays visible for the whole route. */}
      {SEGMENTS.map((seg, i) => (
        <path
          key={`trail-${seg.from}-${seg.to}`}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          d={seg.d}
          fill="none"
          stroke="var(--trail)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      ))}

      <DepotMark x={ORIGIN.x} y={ORIGIN.y} />

      {stopStates.map((stop) => (
        <StopPin key={stop.id} stop={stop} transition={pinTransition} />
      ))}

      <TruckMark ref={truckRef} />
    </svg>
  );
}
