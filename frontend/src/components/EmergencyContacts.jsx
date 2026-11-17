import React from 'react';
import { IconPhone } from './ui/Icons.jsx';

const CONTACTS = [
  { label: 'National Emergency Helpline', number: '112', desc: 'All emergencies (Police, Fire, Medical)' },
  { label: 'Ambulance & Medical Emergency', number: '108', desc: 'Emergency trauma & medical response' },
  { label: 'Fire Service', number: '101', desc: 'Fire hazards & structural collapse' },
  { label: 'Police Control Room', number: '100', desc: 'Security & crowd control' },
  { label: 'Disaster Management Helpline', number: '1078', desc: 'National Disaster Management Authority (NDMA)' },
  { label: 'Women Helpline', number: '1091', desc: 'Safety & emergency assistance' },
];

export default function EmergencyContacts({ dark = false }) {
  return (
    <div
      className={`rounded-panel p-5 border ${
        dark
          ? 'bg-surfaceDark-panel border-surfaceDark-border text-white'
          : 'bg-white border-line text-slate-900 shadow-panel'
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-6 h-6 rounded-control bg-coral-100 text-coral-700 flex items-center justify-center">
          <IconPhone width={14} height={14} />
        </span>
        <h3 className="text-sm font-bold uppercase tracking-wide font-mono">
          Immediate Emergency Helplines (India)
        </h3>
      </div>
      <p
        className={`text-xs mb-4 leading-relaxed ${
          dark ? 'text-slate-400' : 'text-slate-600'
        }`}
      >
        For life-threatening emergencies, call directly. Do not wait for an app status update.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CONTACTS.map((c) => (
          <div
            key={c.number}
            className={`p-3 rounded-control border flex items-center justify-between gap-3 ${
              dark
                ? 'bg-surfaceDark-raised border-surfaceDark-border hover:border-slate-500'
                : 'bg-slate-50/70 border-line hover:border-blue-700/50'
            } transition-colors`}
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{c.label}</p>
              <p className="text-[11px] text-slate-400 truncate">{c.desc}</p>
            </div>
            <a
              href={`tel:${c.number}`}
              className="px-3 py-1.5 rounded-control bg-coral-700 hover:bg-coral-800 text-white font-mono font-bold text-xs tracking-wider shrink-0 transition-colors shadow-xs"
              aria-label={`Call ${c.label} on ${c.number}`}
            >
              {c.number}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
