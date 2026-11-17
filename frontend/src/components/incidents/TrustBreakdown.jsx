import React from 'react';
import { CapacityMeter } from '../ui/Indicators.jsx';
import { IconShieldCheck, IconInfo } from '../ui/Icons.jsx';

export function TrustBreakdown({ verification, dark = false }) {
  if (!verification) return null;

  const components = [
    {
      name: 'GPS Consistency',
      score: verification.gpsScore ?? 50,
      weight: '30%',
      desc: 'Proximity of device submission to claimed incident location',
    },
    {
      name: 'Crowd Corroboration',
      score: verification.crowdScore ?? 50,
      weight: '25%',
      desc: 'Community confirmed vs disputed votes (neutral baseline 50)',
    },
    {
      name: 'Authority Review',
      score: verification.authorityScore ?? 40,
      weight: '25%',
      desc: 'Verified by EOC officer or assigned rescue organization',
    },
    {
      name: 'AI Confidence',
      score: verification.aiScore ?? 50,
      weight: '20%',
      desc: 'Language & multi-signal NLP confidence score (advisory)',
    },
  ];

  return (
    <div
      className={`rounded-panel p-4 border ${
        dark
          ? 'bg-surfaceDark-panel border-surfaceDark-border text-white'
          : 'bg-white border-line text-slate-900'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <IconShieldCheck width={16} height={16} className="text-teal-600" />
          <h4 className="text-xs font-bold uppercase font-mono tracking-wider">
            System Trust Signal Breakdown
          </h4>
        </div>
        <span
          className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
            dark ? 'bg-teal-950/60 text-teal-300' : 'bg-teal-50 text-teal-800'
          }`}
        >
          Score: {verification.trustScore}/100
        </span>
      </div>

      <p className="text-[11px] text-slate-400 mb-3.5 leading-relaxed">
        Algorithmic composite signal for operational prioritization. Not factual ground truth.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {components.map((item) => (
          <div
            key={item.name}
            className={`p-2.5 rounded-control border ${
              dark
                ? 'bg-surfaceDark-raised border-surfaceDark-border'
                : 'bg-slate-50/70 border-line'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold">{item.name}</span>
              <span className="font-mono text-[11px] text-slate-400">
                {item.score}/100 ({item.weight})
              </span>
            </div>
            <div
              className={`h-1.5 w-full rounded-full overflow-hidden ${
                dark ? 'bg-ink-800' : 'bg-slate-200'
              }`}
            >
              <div
                className="h-full bg-blue-700 rounded-full transition-all duration-300"
                style={{ width: `${item.score}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-400 leading-tight">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrustBreakdown;
