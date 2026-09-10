import { STOPS, KM_PER_UNIT, BASE_SPEED } from './routeData';

const DELIVERIES = STOPS.slice(1);

export const selectRoute = (s) => s.route;
export const selectStatus = (s) => s.route.status;
export const selectIsPaused = (s) => s.route.isPaused;
export const selectSpeed = (s) => s.route.speed;
export const selectDistance = (s) => s.route.distance;
export const selectCompletedCount = (s) => s.route.completedCount;
export const selectGeometry = (s) => s.route.geometry;

export const toKm = (units) => units * KM_PER_UNIT;

export const selectNextStopIndex = (s) => {
  const { completedCount, status } = s.route;
  if (status === 'complete') return null;
  return completedCount;
};

export const selectNextStop = (s) => {
  const i = selectNextStopIndex(s);
  return i === null ? null : DELIVERIES[i];
};


export const selectDistanceToNextStop = (s) => {
  const i = selectNextStopIndex(s);
  const { stopDistances } = s.route.geometry;
  if (i === null || !stopDistances[i]) return 0;
  return Math.max(0, stopDistances[i] - s.route.distance);
};

export const selectEtaSeconds = (s) => {
  const { status, speed, isPaused } = s.route;
  if (status === 'complete' || status === 'idle') return null;
  if (status === 'delivering' || isPaused) return null;
  const remaining = selectDistanceToNextStop(s);
  return remaining / (BASE_SPEED * speed);
};

// how much of the route has been completed
export const selectProgress = (s) => {
  const { total } = s.route.geometry;
  if (!total) return 0;
  return Math.min(1, s.route.distance / total);
};

//  Per-stop display state.
export const selectStopStates = (s) => {
  const { completedCount, status } = s.route;
  return DELIVERIES.map((stop, i) => {
    if (i < completedCount) return { ...stop, state: 'delivered' };
    if (status === 'delivering' && i === completedCount) {
      return { ...stop, state: 'delivering' };
    }
    return { ...stop, state: 'pending' };
  });
};

// Legend summary of truck status
export const selectStatusLabel = (s) => {
  const { status, isPaused, completedCount } = s.route;
  const next = DELIVERIES[completedCount];

  if (status === 'idle') return 'Waiting at depot';
  if (status === 'complete') return 'Route complete';
  if (isPaused) return 'Paused';
  if (status === 'delivering') return `Delivering at ${next?.label ?? ''}`;

  const from = completedCount === 0 ? 'Depot' : DELIVERIES[completedCount - 1].label;
  return `In transit · ${from} to ${next?.label ?? ''}`;
};

//  Primary button status
export const selectPrimaryAction = (s) => {
  const { status, isPaused } = s.route;
  if (status === 'idle') return 'start';
  if (status === 'complete') return 'done';
  return isPaused ? 'resume' : 'pause';
};