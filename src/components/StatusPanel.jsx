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
      <div className="text-[10px] font-semibold uppercase tracking-[0.09em] text-(--text-soft)">
        {label}
      </div>
      <div
        className={`tnum mt-1 text-[22px] font-semibold leading-none tracking-tight ${
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
      className="flex w-full shrink-0 flex-col border-t border-(--line) bg-(--panel) lg:w-[352px] lg:border-l lg:border-t-0"
      aria-label="Truck status"
    >
      {/* Question one: where is the truck. Largest thing in the panel. */}
      <div className="border-b border-(--line) px-6 py-5">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: dotColour }}
          />
          <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-(--text-soft)">
            Status
          </span>
        </div>

        <h2 className="mt-2 text-[26px] font-bold leading-[1.12] tracking-tight text-(--text)">
          {statusLabel}
        </h2>

        {/* Screen readers hear status changes without watching the map. The text
            is memoized on discrete state, so the ~10Hz distance ticks re-render
            this node without changing it — no repeat announcements. */}
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--line)">
            <div
              className="motion-travel h-full rounded-full bg-(--trail) transition-[width] duration-150 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="tnum shrink-0 text-[12px] font-semibold text-(--text-soft)">
            {completed}/{stops.length}
          </span>
        </div>
      </div>

      {/* Questions two and three. */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-b border-(--line) px-6 py-5">
        <Readout label="Next stop" value={nextStop ? nextStop.label : '—'} />
        <Readout
          // While unloading the countdown is to the end of the unload, not to an
          // arrival. Naming it plainly keeps the readout honest against the map.
          label={status === 'delivering' ? 'Unloading ends in' : 'ETA'}
          value={formatEta(eta)}
          tone="accent"
        />
        <Readout label="Covered" value={`${toKm(distance).toFixed(2)} km`} />
        <Readout label="Route length" value={`${toKm(total).toFixed(2)} km`} />
      </div>

      {/* The manifest. Scrolls independently so the readouts above never leave
          the viewport on a short screen. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.09em] text-(--text-soft)">
          Drops
        </div>

        <ol className="mt-3 space-y-1">
          {stops.map((stop) => {
            const { dot, ink, label: stateLabel, emphatic } = STOP_STATE[stop.state];
            const live = stop.state === 'delivering';
            return (
              <li
                key={stop.id}
                // The stop being served is lifted onto its own tinted row, so
                // the eye lands on it before reading any word.
                className={`flex items-center gap-3 rounded-md px-2 py-2 ${
                  live ? 'bg-(--accent)/10' : ''
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: `var(${dot})` }}
                />
                <span className="w-6 shrink-0 text-[13px] font-bold text-(--text)">
                  {stop.label}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-(--text-soft)">
                  {stop.name}
                </span>
                {/* The state word carries its own colour and weight when it is
                    live or done, so the three states separate at a glance
                    rather than only on close reading of a grey column. */}
                <span
                  className="shrink-0 text-[11px] font-semibold"
                  style={{ color: emphatic ? `var(${ink})` : 'var(--text-soft)' }}
                >
                  {stateLabel}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
