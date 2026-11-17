import React from 'react';
import {
  IconAlertOctagon,
  IconAlertTriangle,
  IconCheckCircle,
  IconShieldCheck,
  IconClock,
  IconAlertCircle,
  IconActivity,
  IconCheck,
} from './Icons.jsx';

export function SeverityIndicator({ severity = 'medium', pulse = false, dark = false }) {
  const norm = String(severity).toLowerCase();

  const configs = {
    critical: {
      label: 'Critical',
      icon: <IconAlertOctagon width={13} height={13} />,
      light: 'bg-coral-100 text-coral-700 border-coral-200',
      dark: 'bg-coral-950/60 text-coral-300 border-coral-800/80',
      dot: 'bg-coral-600',
    },
    high: {
      label: 'High',
      icon: <IconAlertTriangle width={13} height={13} />,
      light: 'bg-amber-100 text-amber-800 border-amber-200',
      dark: 'bg-amber-950/60 text-amber-300 border-amber-800/80',
      dot: 'bg-amber-600',
    },
    medium: {
      label: 'Medium',
      icon: <span className="inline-block w-2 h-2 rounded-full bg-amber-600" />,
      light: 'bg-amber-50 text-amber-700 border-amber-200',
      dark: 'bg-amber-900/40 text-amber-300 border-amber-700/60',
      dot: 'bg-amber-500',
    },
    low: {
      label: 'Low',
      icon: <IconCheckCircle width={13} height={13} />,
      light: 'bg-teal-100 text-teal-700 border-teal-200',
      dark: 'bg-teal-950/60 text-teal-300 border-teal-800/80',
      dot: 'bg-teal-500',
    },
  };

  const c = configs[norm] || configs.medium;
  const themeClass = dark ? c.dark : c.light;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-badge text-[11px] font-semibold tracking-wide border uppercase font-mono ${themeClass}`}
    >
      <span className="relative flex items-center justify-center">
        {pulse && norm === 'critical' && (
          <span
            className={`absolute inline-flex h-3 w-3 rounded-full opacity-75 animate-ping ${c.dot}`}
          />
        )}
        {c.icon}
      </span>
      <span>{c.label}</span>
    </span>
  );
}

export function TrustIndicator({ verification, dark = false }) {
  if (!verification) return null;
  const state = String(verification.trustState || 'pending').toLowerCase();
  const score = verification.trustScore ?? 50;

  const configs = {
    highly_trusted: {
      label: 'Highly Trusted',
      icon: <IconShieldCheck width={13} height={13} />,
      light: 'bg-teal-100 text-teal-800 border-teal-200',
      dark: 'bg-teal-950/60 text-teal-300 border-teal-800',
    },
    verified: {
      label: 'Verified',
      icon: <IconShieldCheck width={13} height={13} />,
      light: 'bg-teal-100 text-teal-700 border-teal-200',
      dark: 'bg-teal-950/60 text-teal-300 border-teal-800',
    },
    pending: {
      label: 'Pending',
      icon: <IconClock width={13} height={13} />,
      light: 'bg-slate-100 text-slate-700 border-slate-200',
      dark: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    suspicious: {
      label: 'Suspicious',
      icon: <IconAlertCircle width={13} height={13} />,
      light: 'bg-coral-100 text-coral-700 border-coral-200',
      dark: 'bg-coral-950/60 text-coral-300 border-coral-800',
    },
  };

  const c = configs[state] || configs.pending;
  const themeClass = dark ? c.dark : c.light;

  const tooltip = `System Trust Score: ${score}/100\nGPS: ${verification.gpsScore ?? 'N/A'} (30%)\nCrowd: ${verification.crowdScore ?? 'N/A'} (25%)\nAuthority: ${verification.authorityScore ?? 'N/A'} (25%)\nAI: ${verification.aiScore ?? 'N/A'} (20%)\nAdvisory signal, not ground truth.`;

  return (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-badge text-[11px] font-medium tracking-wide border font-mono ${themeClass}`}
    >
      {c.icon}
      <span>
        {c.label} · {score}
      </span>
    </span>
  );
}

export function StatusIndicator({ status = 'reported', dark = false }) {
  const norm = String(status).toLowerCase();

  const configs = {
    reported: {
      label: 'Reported',
      icon: <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />,
      light: 'bg-blue-100 text-blue-700 border-blue-200',
      dark: 'bg-blue-950/60 text-blue-300 border-blue-800',
    },
    acknowledged: {
      label: 'Acknowledged',
      icon: <IconCheck width={12} height={12} />,
      light: 'bg-amber-100 text-amber-700 border-amber-200',
      dark: 'bg-amber-950/60 text-amber-300 border-amber-800',
    },
    dispatched: {
      label: 'Dispatched',
      icon: <IconActivity width={12} height={12} />,
      light: 'bg-blue-100 text-blue-700 border-blue-200',
      dark: 'bg-blue-950/60 text-blue-300 border-blue-800',
    },
    in_progress: {
      label: 'In Progress',
      icon: <IconActivity width={12} height={12} className="animate-spin" />,
      light: 'bg-blue-100 text-blue-800 border-blue-300',
      dark: 'bg-blue-900/40 text-blue-300 border-blue-700',
    },
    resolved: {
      label: 'Resolved',
      icon: <IconCheckCircle width={12} height={12} />,
      light: 'bg-teal-100 text-teal-700 border-teal-200',
      dark: 'bg-teal-950/60 text-teal-300 border-teal-800',
    },
    merged: {
      label: 'Merged',
      icon: <span className="text-[10px]">⇄</span>,
      light: 'bg-slate-100 text-slate-700 border-slate-200',
      dark: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    rejected: {
      label: 'Rejected',
      icon: <span className="text-[10px]">✕</span>,
      light: 'bg-coral-100 text-coral-700 border-coral-200',
      dark: 'bg-coral-950/60 text-coral-300 border-coral-800',
    },
  };

  const c = configs[norm] || configs.reported;
  const themeClass = dark ? c.dark : c.light;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-badge text-[11px] font-semibold tracking-wide border uppercase font-mono ${themeClass}`}
    >
      {c.icon}
      <span>{c.label}</span>
    </span>
  );
}

export function CapacityMeter({
  used = 0,
  total = 100,
  unit = 'units',
  status = 'operational',
  dark = false,
}) {
  const safeTotal = Math.max(1, total);
  const percent = Math.min(100, Math.round((used / safeTotal) * 100));

  let barColor = 'bg-teal-700';
  let badgeColor = 'bg-teal-100 text-teal-800';

  if (percent >= 90 || status === 'full') {
    barColor = 'bg-coral-700';
    badgeColor = 'bg-coral-100 text-coral-800';
  } else if (percent >= 60) {
    barColor = 'bg-amber-700';
    badgeColor = 'bg-amber-100 text-amber-800';
  }

  if (status === 'closed') {
    barColor = 'bg-slate-500';
    badgeColor = 'bg-slate-100 text-slate-700';
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className={dark ? 'text-slate-300' : 'text-slate-600'}>
          {used} / {total} {unit} ({percent}%)
        </span>
        <span
          className={`px-1.5 py-0.5 rounded-badge text-[10px] uppercase font-semibold ${badgeColor}`}
        >
          {status}
        </span>
      </div>
      <div
        className={`h-2.5 w-full rounded-full overflow-hidden ${
          dark ? 'bg-ink-800' : 'bg-slate-200'
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={used}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
    </div>
  );
}
