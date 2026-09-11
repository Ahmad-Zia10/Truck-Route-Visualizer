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

const READOUT_TONE = {
  accent: 'text-(--accent-ink)',
  done: 'text-(--pin-done)',
  default: 'text-(--text)',
};

function Readout({ label, value, tone = 'default' }) {
  return (
    <div>
      <div className="text-[12px] text-(--text-soft)">{label}</div>
      <div
        className={`tnum mt-1 text-[19px] font-semibold leading-none tracking-tight ${READOUT_TONE[tone]}`}
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
      {/* Question one: what is happening now. Body size — the dot carries the
          state, and the drops list below is what the panel is for. */}
      <div className="border-b border-(--line) px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: dotColour }}
          />
          <h2 className="text-[14px] font-medium leading-tight text-(--text)">
            {statusLabel}
          </h2>
        </div>

        {/* Screen readers hear status changes without watching the map. The text
            is memoized on discrete state, so the ~10Hz distance ticks re-render
            this node without changing it — no repeat announcements. */}
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>

      {/* Questions two and three. */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-b border-(--line) px-6 py-5">
        {/* The aggregate the drops list only implies. It stays a single figure
            at any stop count, where counting green rows stops scaling. */}
        <Readout
          label="Completed"
          value={`${completed}/${stops.length}`}
          tone={status === 'complete' ? 'done' : 'default'}
        />
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

      {/* The manifest — the visual centre of the panel, and the last thing in
          the reading order: what has been delivered. Scrolls independently so
          the readouts above never leave the viewport on a short screen. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <ol>
          {stops.map((stop) => {
            const { dot, ink, label: stateLabel, emphatic } = STOP_STATE[stop.state];
            const live = stop.state === 'delivering';
            return (
              <li
                key={stop.id}
                // The stop being served is lifted onto its own tinted row, so
                // the eye lands on it before reading any word.
                className={`flex items-center gap-3 rounded-md px-2 py-3.5 ${
                  live ? 'bg-(--accent)/10' : ''
                }`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: `var(${dot})` }}
                />
                <span className="w-7 shrink-0 text-[15px] font-semibold text-(--text)">
                  {stop.label}
                </span>
                <span className="min-w-0 flex-1 truncate text-[14px] text-(--text-soft)">
                  {stop.name}
                </span>
                {/* The state word carries its own colour and weight when it is
                    live or done, so the three states separate at a glance
                    rather than only on close reading of a grey column. */}
                <span
                  className="shrink-0 text-[13px] font-semibold"
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
