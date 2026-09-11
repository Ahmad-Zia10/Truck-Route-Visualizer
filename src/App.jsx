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
    <div className="min-h-screen">
      <header className="border-b border-(--line)">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-4">
          <div>
            <h1 className="text-[19px] font-bold tracking-tight text-(--text)">
              Route VNS-114
            </h1>
            <p className="text-sm text-(--text-soft)">
              Morning dispatch · 3 drops
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            aria-pressed={dark}
            className="ml-auto min-h-11 rounded-md border border-(--line) px-3.5 text-sm font-medium text-(--text-soft) transition-colors hover:text-(--text)"
          >
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-(--line)">
              <RouteMap />
            </div>
            <Controls />
          </div>
          <StatusPanel />
        </div>
      </main>
    </div>
  );
}