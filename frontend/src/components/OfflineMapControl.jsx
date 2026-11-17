import React, { useState } from 'react';
import { downloadTilesForOfflineUse } from '../utils/offlineMap.js';
import Button from './ui/Button.jsx';
import { IconLayers, IconCheckCircle, IconAlertCircle } from './ui/Icons.jsx';

const RADIUS_OPTIONS = [2, 5, 10];

export default function OfflineMapControl({ center = [19.076, 72.8777], dark = false }) {
  const [radiusKm, setRadiusKm] = useState(5);
  const [status, setStatus] = useState('idle'); // idle | downloading | done | error
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  const handleDownload = async () => {
    setStatus('downloading');
    setProgress({ completed: 0, total: 0 });
    try {
      const [lat, lng] = center;
      const result = await downloadTilesForOfflineUse({ lat, lng, radiusKm }, (completed, total) =>
        setProgress({ completed, total })
      );
      setProgress({ completed: result.tilesDownloaded, total: result.totalTiles });
      setStatus('done');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div
      className={`rounded-panel p-5 border ${
        dark
          ? 'bg-surfaceDark-panel border-surfaceDark-border text-white'
          : 'bg-white border-line text-slate-900 shadow-panel'
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-6 h-6 rounded-control bg-blue-100 text-blue-700 flex items-center justify-center">
          <IconLayers width={14} height={14} />
        </span>
        <h3 className="text-sm font-bold uppercase tracking-wide font-mono">
          Offline Map Tile Cache
        </h3>
      </div>
      <p
        className={`text-xs mb-3 leading-relaxed ${
          dark ? 'text-slate-400' : 'text-slate-600'
        }`}
      >
        Proactively cache OpenStreetMap tiles around your current position so map graphics remain visible during network outages.
      </p>

      {/* Notice about scope */}
      <div
        className={`p-2.5 rounded-control text-[11px] mb-3.5 border ${
          dark
            ? 'bg-amber-950/40 border-amber-800 text-amber-200'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        <strong>Notice:</strong> Cached map tiles do not provide offline incident submission, live GPS tracking, or real-time broadcast reception.
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-xs font-semibold uppercase font-mono ${
            dark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          Radius:
        </span>
        <div className="flex gap-1.5">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRadiusKm(r)}
              disabled={status === 'downloading'}
              className={`px-2.5 py-1 text-xs font-mono rounded-control border transition-colors ${
                radiusKm === r
                  ? 'bg-blue-700 text-white border-blue-700 font-bold'
                  : dark
                  ? 'border-surfaceDark-border text-slate-300 hover:bg-surfaceDark-raised'
                  : 'border-line text-slate-700 hover:bg-slate-50'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      <Button
        size="md"
        variant={dark ? 'dark' : 'secondary'}
        onClick={handleDownload}
        disabled={status === 'downloading'}
        loading={status === 'downloading'}
        className="w-full font-mono text-xs"
      >
        {status === 'downloading'
          ? `Downloading Tiles (${percent}%)…`
          : `Cache ${radiusKm}km Radius for Offline`}
      </Button>

      {status === 'downloading' && (
        <div
          className={`mt-3 h-2 w-full rounded-full overflow-hidden ${
            dark ? 'bg-surfaceDark-raised' : 'bg-slate-200'
          }`}
        >
          <div
            className="h-full bg-blue-700 transition-all duration-200 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {status === 'done' && (
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-teal-700 dark:text-teal-400">
          <IconCheckCircle width={16} height={16} />
          <span>{progress.total} map tiles cached successfully into local browser storage.</span>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-coral-700 dark:text-coral-400">
          <IconAlertCircle width={16} height={16} />
          <span>Could not complete tile cache. Ensure local browser storage is permitted.</span>
        </div>
      )}
    </div>
  );
}
