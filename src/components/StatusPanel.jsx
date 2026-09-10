import { useSelector } from 'react-redux';
import {
  selectStatusLabel,
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
          tone === 'accent' ? 'text-(--accent)' : 'text-(--text)'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default function StatusPanel() {
  const statusLabel = useSelector(selectStatusLabel);
  const status = useSelector(selectStatus);
  const distance = useSelector(selectDistance);
  const { total } = useSelector(selectGeometry);
  const nextStop = useSelector(selectNextStop);
  const eta = useSelector(selectEtaSeconds);
  const stops = useSelector(selectStopStates);
  const completed = useSelector(selectCompletedCount);
  const progress = useSelector(selectProgress);

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
      className="rounded-lg border border(--line) bg-(--panel) p-5"
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

      {/* Screen readers hear status changes without watching the map. */}
      <p className="sr-only" aria-live="polite">
        {statusLabel}. {completed} of {stops.length} deliveries complete.
      </p>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-(--line)">
        <div
          className="h-full rounded-full bg-(--trail) transition-[width] duration-150 ease-linear"
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
        <Readout label="ETA" value={formatEta(eta)} tone="accent" />
      </div>

      <ol className="mt-5 space-y-2.5 border-t border-(--line) pt-4">
        {stops.map((stop) => (
          <li key={stop.id} className="flex items-center gap-3">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                background:
                  stop.state === 'delivered'
                    ? 'var(--pin-done)'
                    : stop.state === 'delivering'
                      ? 'var(--pin-active)'
                      : 'var(--pin-pending)',
              }}
            />
            <span className="text-sm font-medium text-(--text)">
              {stop.label}
            </span>
            <span className="truncate text-sm text-(--text-soft)">
              {stop.name}
            </span>
            <span className="ml-auto text-[11px] font-medium text-(--text-soft)">
              {stop.state === 'delivered'
                ? 'Delivered'
                : stop.state === 'delivering'
                  ? 'Unloading'
                  : 'Pending'}
            </span>
          </li>
        ))}
      </ol>

      <p className="tnum mt-4 text-sm text-(--text-soft)">
        {completed} of {stops.length} deliveries complete
      </p>
    </section>
  );
}