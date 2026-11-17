import React from 'react';
import { SeverityIndicator, TrustIndicator, StatusIndicator } from '../ui/Indicators.jsx';
import { IconAlertTriangle } from '../ui/Icons.jsx';

const SEVERITY_STRIPES = {
  critical: 'bg-coral-700',
  high: 'bg-amber-700',
  medium: 'bg-amber-600',
  low: 'bg-teal-700',
};

function formatShortTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function IncidentQueueItem({
  incident,
  isSelected = false,
  onClick,
  dark = false,
}) {
  const stripe = SEVERITY_STRIPES[incident.severity] || 'bg-slate-400';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`group relative flex items-stretch gap-3 p-3.5 rounded-control border cursor-pointer transition-all ${
        isSelected
          ? dark
            ? 'bg-surfaceDark-highlight border-blue-600 shadow-sm'
            : 'bg-blue-50/80 border-blue-700 shadow-xs'
          : dark
          ? 'bg-surfaceDark-panel border-surfaceDark-border hover:bg-surfaceDark-raised'
          : 'bg-white border-line hover:border-slate-300'
      }`}
    >
      {/* Severity Color Stripe */}
      <span className={`w-1 rounded-full shrink-0 ${stripe}`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4
            className={`text-xs sm:text-sm font-bold truncate leading-tight ${
              dark ? 'text-white' : 'text-ink-950'
            }`}
          >
            {incident.title}
          </h4>
          <SeverityIndicator severity={incident.severity} dark={dark} />
        </div>

        <p
          className={`text-xs truncate mb-2 ${
            dark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          {incident.category} · {incident.location?.address || 'Location on file'}
        </p>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusIndicator status={incident.status} dark={dark} />
            {incident.verification && (
              <TrustIndicator verification={incident.verification} dark={dark} />
            )}
            {incident.escalated && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-coral-100 text-coral-800 dark:bg-coral-950/80 dark:text-coral-300 border border-coral-300 dark:border-coral-800">
                <IconAlertTriangle width={11} height={11} /> Escalated
              </span>
            )}
          </div>

          <span
            className={`text-[10px] font-mono shrink-0 ${
              dark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {formatShortTime(incident.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default IncidentQueueItem;
