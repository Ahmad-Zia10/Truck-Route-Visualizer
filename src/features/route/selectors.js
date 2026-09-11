import { STOPS, KM_PER_UNIT, BASE_SPEED, DWELL_SECONDS } from './routeData';
import { createSelector } from '@reduxjs/toolkit';

const DELIVERIES = STOPS.slice(1);

export const selectStatus = (s) => s.route.status;
export const selectIsPaused = (s) => s.route.isPaused;
export const selectSpeed = (s) => s.route.speed;
export const selectDistance = (s) => s.route.distance;
export const selectCompletedCount = (s) => s.route.completedCount;
export const selectGeometry = (s) => s.route.geometry;
export const selectDwell = (s) => s.route.dwell;
export const selectElapsed = (s) => s.route.elapsed;

export const toKm = (units) => units * KM_PER_UNIT;

export const selectNextStopIndex = (s) => {
  const { completedCount, status } = s.route;
  if (status === 'complete') return null;
  return completedCount;
};

export const selectNextStop = createSelector(
  [selectNextStopIndex],
  (i) => (i === null ? null : DELIVERIES[i]),
);


export const selectDistanceToNextStop = (s) => {
  const i = selectNextStopIndex(s);
  const { stopDistances } = s.route.geometry;
  if (i === null || !stopDistances[i]) return 0;
  return Math.max(0, stopDistances[i] - s.route.distance);
};

// Simulated seconds until the truck reaches the stop shown as "Next stop".
//
// While unloading, "Next stop" is still the stop being served, so the remaining
// figure is the rest of the dwell — the truck is there, and what is left is the
// unload. While in transit it is travel time. While paused the figure is held
// rather than blanked: "when does it reach the next one" is one of the three
// questions this screen exists to answer, and pausing does not unanswer it.
//
// Everything is simulated truck time, so the number stays consistent with the
// map at any demo speed rather than tracking the reviewer's wall clock.
export const selectEtaSeconds = (s) => {
  const { status, dwell } = s.route;
  if (status === 'complete' || status === 'idle') return null;

  if (status === 'delivering') return Math.max(0, DWELL_SECONDS - dwell);
  return selectDistanceToNextStop(s) / BASE_SPEED;
};

//  Per-stop display state.
export const selectStopStates = createSelector(
  [selectCompletedCount, selectStatus],
  (completedCount, status) =>
    DELIVERIES.map((stop, i) => {
      if (i < completedCount) return { ...stop, state: 'delivered' };
      if (status === 'delivering' && i === completedCount) {
        return { ...stop, state: 'delivering' };
      }
      return { ...stop, state: 'pending' };
    }),
);

// Legend summary of truck status. Memoized on the three discrete inputs so the
// string identity is stable across distance ticks.
export const selectStatusLabel = createSelector(
  [selectStatus, selectIsPaused, selectCompletedCount],
  (status, isPaused, completedCount) => {
    const next = DELIVERIES[completedCount];

    if (status === 'idle') return 'Waiting at depot';
    if (status === 'complete') return 'Route complete';
    if (isPaused) return 'Paused';
    if (status === 'delivering') return `Delivering at ${next?.label ?? ''}`;

    const from =
      completedCount === 0 ? 'Depot' : DELIVERIES[completedCount - 1].label;
    return `In transit · ${from} to ${next?.label ?? ''}`;
  },
);

// What the live region announces. Deliberately derived only from discrete
// state — status, pause, completion — so the ~10Hz distance ticks never
// re-announce. A screen reader hears the six state changes that matter, not
// a stream of repetition.
export const selectAnnouncement = createSelector(
  [selectStatusLabel, selectCompletedCount],
  (label, completed) =>
    `${label}. ${completed} of ${DELIVERIES.length} deliveries complete.`,
);

//  Primary button status
export const selectPrimaryAction = (s) => {
  const { status, isPaused } = s.route;
  if (status === 'idle') return 'start';
  if (status === 'complete') return 'done';
  return isPaused ? 'resume' : 'pause';
};