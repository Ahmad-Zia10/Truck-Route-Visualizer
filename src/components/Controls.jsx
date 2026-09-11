import { useDispatch, useSelector } from 'react-redux';
import { SPEED_OPTIONS } from '../features/route/routeData';
import {
  started,
  pauseToggled,
  reset,
  speedChanged,
} from '../features/route/routeSlice';
import {
  selectPrimaryAction,
  selectSpeed,
  selectStatus,
} from '../features/route/selectors';

const LABELS = {
  start: 'Start route',
  pause: 'Pause',
  resume: 'Resume',
  done: 'Route complete',
};

export default function Controls() {
  const dispatch = useDispatch();

  const action = useSelector(selectPrimaryAction);
  const speed = useSelector(selectSpeed);
  const status = useSelector(selectStatus);

  const onPrimary = () => {
    if (action === 'start') dispatch(started());
    else if (action !== 'done') dispatch(pauseToggled());
  };

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-(--line) bg-(--panel) px-5 py-3">
      <button
        type="button"
        onClick={onPrimary}
        disabled={action === 'done'}
        className="min-h-11 rounded-md bg-(--accent) px-6 text-sm font-semibold text-(--on-accent) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {LABELS[action]}
      </button>

      <button
        type="button"
        onClick={() => dispatch(reset())}
        disabled={status === 'idle'}
        className="min-h-11 rounded-md border border-(--line) px-4 text-sm font-medium text-(--text) transition-colors hover:bg-(--surface) disabled:cursor-not-allowed disabled:opacity-40"
      >
        Reset
      </button>

      {/* Labelled as a simulation control, not dispatch tooling: a real
          dispatcher cannot fast-forward a truck. It exists so a reviewer can
          watch the whole route in about fifteen seconds. */}
      <div className="ml-auto flex items-center gap-2.5">
        <span
          id="sim-speed-label"
          className="text-[10px] font-semibold uppercase tracking-[0.09em] text-(--text-soft)"
        >
          Simulation speed
        </span>
        <div
          className="flex items-center gap-1 rounded-md border border-(--line) p-1"
          role="group"
          aria-labelledby="sim-speed-label"
        >
          {SPEED_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => dispatch(speedChanged(option))}
              aria-pressed={speed === option}
              className={`tnum min-h-9 min-w-11 rounded text-sm font-medium transition-colors ${
                speed === option
                  ? 'bg-(--accent) text-(--on-accent)'
                  : 'text-(--text-soft) hover:text-(--text)'
              }`}
            >
              {option}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
