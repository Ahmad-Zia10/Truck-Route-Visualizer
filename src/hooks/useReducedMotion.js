import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

const subscribe = (onChange) => {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
};

const getSnapshot = () => window.matchMedia(QUERY).matches;

// Server/prerender has no matchMedia; assume motion is allowed.
const getServerSnapshot = () => false;

/**
 * Tracks the user's reduced-motion preference and re-renders when it changes,
 * so motion decisions made in JS stay in step with the CSS media query.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
