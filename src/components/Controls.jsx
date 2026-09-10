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
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onPrimary}
        disabled={action === 'done'}
        className="rounded-md bg-(--accent) px-5 py-2.5 text-sm font-semibold text-[#1b1f22] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {LABELS[action]}
      </button>

      <button
        type="button"
        onClick={() => dispatch(reset())}
        disabled={status === 'idle'}
        className="rounded-md border border-(--line) px-4 py-2.5 text-sm font-medium text-(--text) transition-colors hover:bg-(--map-bg) disabled:cursor-not-allowed disabled:opacity-40"
      >
        Reset
      </button>

      <div
        className="ml-auto flex items-center gap-1 rounded-md border border-(--line) p-1"
        role="group"
        aria-label="Playback speed"
      >
        {SPEED_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => dispatch(speedChanged(option))}
            aria-pressed={speed === option}
            className={`tnum rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              speed === option
                ? 'bg-(--accent) text-[#1b1f22]'
                : 'text-(--text-soft) hover:text-(--text)'
            }`}
          >
            {option}×
          </button>
        ))}
      </div>
    </div>
  );
}