import React from 'react';
import { IconAlertCircle, IconHelpCircle, IconRefreshCw } from './Icons.jsx';
import Button from './Button.jsx';

export function EmptyState({
  title = 'No records found',
  description = 'There are no active items to display at this time.',
  action = null,
  icon = null,
  dark = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-panel border border-dashed ${
        dark
          ? 'border-surfaceDark-border bg-surfaceDark-panel/50 text-slate-400'
          : 'border-line bg-slate-50/50 text-slate-500'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
          dark ? 'bg-surfaceDark-raised text-slate-400' : 'bg-white text-slate-400 shadow-xs'
        }`}
      >
        {icon || <IconHelpCircle width={24} height={24} />}
      </div>
      <h3
        className={`text-sm font-semibold mb-1 ${
          dark ? 'text-slate-200' : 'text-slate-800'
        }`}
      >
        {title}
      </h3>
      <p className="text-xs max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Unable to load data',
  message = 'An error occurred while fetching information from the server.',
  onRetry = null,
  dark = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center rounded-panel border ${
        dark
          ? 'border-coral-900/60 bg-coral-950/20 text-coral-200'
          : 'border-coral-200 bg-coral-50/60 text-coral-900'
      }`}
      role="alert"
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-coral-100 text-coral-700">
        <IconAlertCircle width={20} height={20} />
      </div>
      <h4 className="text-sm font-bold mb-1">{title}</h4>
      <p className="text-xs max-w-sm mb-4 opacity-90">{message}</p>
      {onRetry && (
        <Button
          size="sm"
          variant={dark ? 'outlineDark' : 'secondary'}
          onClick={onRetry}
          icon={<IconRefreshCw width={14} height={14} />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

export function LoadingSkeleton({ lines = 3, dark = false }) {
  return (
    <div
      className="space-y-3 p-4 animate-pulse"
      role="status"
      aria-label="Loading content"
    >
      <div
        className={`h-4 w-1/3 rounded-control ${
          dark ? 'bg-surfaceDark-raised' : 'bg-slate-200'
        }`}
      />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 rounded-control ${
            dark ? 'bg-surfaceDark-raised/70' : 'bg-slate-200/70'
          }`}
          style={{ width: `${90 - i * 15}%` }}
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
