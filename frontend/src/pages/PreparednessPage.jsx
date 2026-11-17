import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import CitizenLayout from '../layouts/CitizenLayout.jsx';
import EOCLayout from '../layouts/EOCLayout.jsx';
import RescueLayout from '../layouts/RescueLayout.jsx';
import FacilityLayout from '../layouts/FacilityLayout.jsx';
import {
  IconCheck,
  IconShieldCheck,
  IconAlertTriangle,
  IconInfo,
} from '../components/ui/Icons.jsx';

const PROTOCOLS = [
  {
    title: 'Monsoon Flood & Water Inundation Protocols',
    tag: 'Flood Safety',
    steps: [
      'Disconnect electrical mains before water enters living spaces.',
      'Do not walk, swim, or drive through moving water. Six inches of rapid water can knock over an adult.',
      'Move elderly family members, medications, and identification documents to higher levels.',
      'Check official ResQNet broadcast alerts for designated dry relief camp locations.',
    ],
  },
  {
    title: 'Fire & Gas Outbreak Guidelines',
    tag: 'Fire Hazard',
    steps: [
      'Evacuate immediately via designated stairwells. Do NOT use elevators during building fires.',
      'Stay low to the floor beneath rising smoke and hot fumes.',
      'Close doors behind you as you exit to slow fire spread.',
      'Immediately alert neighbors and call Fire Brigade on 101 once outside.',
    ],
  },
  {
    title: 'Earthquake & Tremor Safety (Drop, Cover, Hold)',
    tag: 'Earthquake',
    steps: [
      'DROP to your hands and knees to prevent being thrown down.',
      'COVER your head and neck under a sturdy table or desk.',
      'HOLD ON until shaking completely stops before attempting to exit.',
      'Stay away from glass windows, unanchored bookcases, and heavy light fixtures.',
    ],
  },
];

const EMERGENCY_KIT_ITEMS = [
  'Drinking water: minimum 3 liters per person per day for 3 days',
  'Non-perishable canned food and manual can opener',
  'First aid kit with antiseptic, bandages, and prescribed medications',
  'Battery-powered or hand-crank radio and spare batteries',
  'Waterproof pouch with government identification and deeds',
  'Sturdy whistle to signal location to rescue teams',
  'Power bank and phone charging cables',
  'High-intensity LED flashlight',
];

export default function PreparednessPage() {
  const { user } = useAuth();

  const content = (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div>
        <div className="text-[11px] font-mono font-bold uppercase text-blue-700 dark:text-blue-400 tracking-wider mb-1">
          Civic Safety Guidelines
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-ink-950 dark:text-white tracking-tight">
          Emergency Preparedness Guide
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Standard operational protocols and household preparation steps curated in accordance with National Disaster Management Authority (NDMA) standards.
        </p>
      </div>

      <div className="p-3.5 rounded-control bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300 font-mono">
        ℹ Static Educational Content: This guide provides established disaster safety guidance and is not dynamically AI-generated.
      </div>

      {/* Protocols */}
      <div className="space-y-6">
        {PROTOCOLS.map((p, idx) => (
          <div
            key={idx}
            className="p-6 rounded-panel border border-line dark:border-surfaceDark-border bg-white dark:bg-surfaceDark-panel shadow-panel space-y-4"
          >
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {p.tag}
              </span>
              <h2 className="text-lg font-bold text-ink-950 dark:text-white">{p.title}</h2>
            </div>

            <ol className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {p.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {/* Emergency Kit Checklist */}
      <div className="p-6 rounded-panel border border-line dark:border-surfaceDark-border bg-white dark:bg-surfaceDark-panel shadow-panel space-y-4">
        <h2 className="text-lg font-bold text-ink-950 dark:text-white flex items-center gap-2">
          <IconShieldCheck width={20} height={20} className="text-teal-600" />
          <span>72-Hour Household Disaster Survival Kit Checklist</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Ensure these essential items are packed in an easily portable waterproof backpack:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          {EMERGENCY_KIT_ITEMS.map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-control border border-line dark:border-surfaceDark-border bg-paper dark:bg-surfaceDark-raised flex items-start gap-2"
            >
              <IconCheck width={16} height={16} className="text-teal-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!user) return <PublicLayout>{content}</PublicLayout>;
  if (['eoc', 'admin'].includes(user.role)) return <EOCLayout>{content}</EOCLayout>;
  if (user.role === 'rescue_team') return <RescueLayout>{content}</RescueLayout>;
  if (['hospital', 'shelter'].includes(user.role)) {
    return <FacilityLayout facilityType={user.role}>{content}</FacilityLayout>;
  }
  return <CitizenLayout>{content}</CitizenLayout>;
}
