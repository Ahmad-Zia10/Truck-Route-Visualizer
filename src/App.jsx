import { useState, useEffect } from 'react';
import RouteMap from './components/RouteMap';
import StatusPanel from './components/StatusPanel';
import Controls from './components/Controls';

function useTheme() {
  const [dark, setDark] = useState(
    () =>
      window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return [dark, setDark];
}

export default function App() {
  const [dark, setDark] = useTheme();

  return (
    // A dispatcher leaves this open, so it occupies the screen rather than
    // sitting as a document in the middle of one. Below lg the sidebar drops
    // under the map and the page scrolls normally.
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <header className="flex shrink-0 items-center gap-4 border-b border-(--line) bg-(--panel) px-5 py-3">
        <div className="flex min-w-0 items-baseline gap-3">
          <h1 className="shrink-0 text-[15px] font-bold tracking-tight text-(--text)">
            Route VNS-114
          </h1>
          <p className="truncate text-[13px] text-(--text-soft)">
            Morning dispatch · 3 drops
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          aria-pressed={dark}
          className="ml-auto min-h-9 rounded-md border border-(--line) px-3 text-[13px] font-medium text-(--text-soft) transition-colors hover:text-(--text)"
        >
          {dark ? 'Light' : 'Dark'}
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* The map is the surface. It takes the space; everything else
            arranges around it. */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Painted with the land tone so the letterboxing left by the map's
              aspect ratio reads as more ground, not as a gap. Below lg the box
              takes the map's own 8:5 ratio so no dead band opens under it; from
              lg it stretches to fill the column. */}
          <div className="relative aspect-[8/5] overflow-hidden bg-(--map-bg) lg:aspect-auto lg:min-h-0 lg:flex-1">
            <RouteMap />
          </div>
          <Controls />
        </main>

        <StatusPanel />
      </div>
    </div>
  );
}
