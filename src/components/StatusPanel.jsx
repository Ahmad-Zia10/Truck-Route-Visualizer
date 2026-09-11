import { useSelector } from 'react-redux';
import {
  selectStatusLabel,
  selectAnnouncement,
  selectDistance,
  selectGeometry,
  selectNextStop,
  selectEtaSeconds,
  selectStopStates,
  selectCompletedCount,
  selectProgress,
  selectStatus,
  toKm,
} from '../features/route/selectors';

// One place where a delivery state becomes a dot colour, a word, and whether
// that word is emphasised. `ink` is the text-safe form of `dot`; the two differ
// only where the fill colour cannot also clear 4.5:1 as text.
const STOP_STATE = {
  delivered: { dot: '--pin-done', ink: '--pin-done', label: 'Delivered', emphatic: true },
  delivering: { dot: '--pin-active', ink: '--accent-ink', label: 'Unloading', emphatic: true },
  pending: { dot: '--pin-pending', ink: '--text-soft', label: 'Pending', emphatic: false },
};

const formatEta = (seconds) => {
  if (seconds === null) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

function Readout({ label, value, tone = 'default' }) {
  return (
    <div>
      <div className="text-[11px] font-medium tracking-wide text-(--text-soft)">
        {label}
      </div>
      <div
        className={`tnum mt-0.5 text-[15px] font-semibold ${
          tone === 'accent' ? 'text-(--accent-ink)' : 'text-(--text)'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default function StatusPanel() {
  const statusLabel = useSelector(selectStatusLabel);
  const announcement = useSelector(selectAnnouncement);
  const status = useSelector(selectStatus);
  const distance = useSelector(selectDistance);
  const { total } = useSelector(selectGeometry);
  const nextStop = useSelector(selectNextStop);
  const eta = useSelector(selectEtaSeconds);
  const stops = useSelector(selectStopStates);
  const completed = useSelector(selectCompletedCount);
  const progress = useSelector(selectProgress);

  // Same three hues as the pins, so the headline dot and the map agree.
  const dotColour =
    status === 'complete'
      ? 'var(--pin-done)'
      : status === 'delivering'
        ? 'var(--pin-active)'
        : status === 'idle'
          ? 'var(--pin-pending)'
          : 'var(--accent)';

  return (
    <section
      className="rounded-lg border border-(--line) bg-(--panel) p-5"
      aria-label="Truck status"
    >
      <div className="flex items-center gap-2.5">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: dotColour }}
        />
        <h2 className="text-[17px] font-semibold text-(--text)">
          {statusLabel}
        </h2>
      </div>

      {/* Screen readers hear status changes without watching the map. The text
          is memoized on discrete state, so the ~10Hz distance ticks re-render
          this node without changing it — no repeat announcements. */}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-(--line)">
        <div
          className="motion-travel h-full rounded-full bg-(--trail) transition-[width] duration-150 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
        <Readout
          label="Distance covered"
          value={`${toKm(distance).toFixed(2)} km`}
        />
        <Readout
          label="Route length"
          value={`${toKm(total).toFixed(2)} km`}
        />
        <Readout label="Next stop" value={nextStop ? nextStop.label : '—'} />
        <Readout
          // While unloading the countdown is to the end of the unload, not to an
          // arrival. Naming it plainly keeps the readout honest against the map.
          label={status === 'delivering' ? 'Unloading ends in' : 'ETA'}
          value={formatEta(eta)}
          tone="accent"
        />
      </div>

      <ol className="mt-5 space-y-2.5 border-t border-(--line) pt-4">
        {stops.map((stop) => {
          const { dot, ink, label: stateLabel, emphatic } = STOP_STATE[stop.state];
          return (
            <li key={stop.id} className="flex items-center gap-3">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: `var(${dot})` }}
              />
              <span className="text-sm font-medium text-(--text)">
                {stop.label}
              </span>
              <span className="min-w-0 truncate text-sm text-(--text-soft)">
                {stop.name}
              </span>
              {/* The state word carries its own colour and weight when it is
                  live or done, so the three states separate at a glance rather
                  than only on close reading of a uniformly grey column. */}
              <span
                className="ml-auto shrink-0 text-[11px] font-medium"
                style={{ color: emphatic ? `var(${ink})` : 'var(--text-soft)' }}
              >
                {stateLabel}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="tnum mt-4 text-sm text-(--text-soft)">
        {completed} of {stops.length} deliveries complete
      </p>
    </section>
  );
}