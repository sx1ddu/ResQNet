import React from 'react';
import { StatusIndicator } from '../ui/Indicators.jsx';

function formatTimestamp(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function IncidentTimeline({ timeline = [], dark = false }) {
  if (!timeline || timeline.length === 0) {
    return (
      <p className="text-xs text-slate-500 italic">No timeline events recorded yet.</p>
    );
  }

  return (
    <ol className="relative border-l-2 border-line dark:border-surfaceDark-border ml-3 my-2 space-y-4">
      {timeline.map((event, index) => (
        <li key={index} className="relative pl-6">
          {/* Timeline Dot */}
          <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-ink-950 bg-blue-700 flex items-center justify-center shadow-xs" />

          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <StatusIndicator status={event.status} dark={dark} />
            <span
              className={`text-[11px] font-mono ${
                dark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {formatTimestamp(event.at || event.timestamp)}
            </span>
          </div>

          {event.note && (
            <p
              className={`text-xs leading-relaxed ${
                dark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              {event.note}
            </p>
          )}

          {event.actor && (
            <p
              className={`text-[10px] font-mono mt-0.5 ${
                dark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Recorded by: {typeof event.actor === 'object' ? event.actor.name || event.actor.email : event.actor}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

export default IncidentTimeline;
