import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import CitizenLayout from '../layouts/CitizenLayout.jsx';
import EOCLayout from '../layouts/EOCLayout.jsx';
import RescueLayout from '../layouts/RescueLayout.jsx';
import FacilityLayout from '../layouts/FacilityLayout.jsx';
import { IconCheck, IconShieldCheck } from '../components/ui/Icons.jsx';

export default function AccessibilityPage() {
  const { user } = useAuth();

  const content = (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div>
        <div className="text-[11px] font-mono font-bold uppercase text-blue-700 dark:text-blue-400 tracking-wider mb-1">
          Inclusivity & Standards
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-ink-950 dark:text-white tracking-tight">
          Accessibility Statement & Assistance
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          ResQNet is engineered to meet WCAG 2.2 Level AA guidelines, ensuring critical life-safety information remains accessible to all people during high-stress emergencies.
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-panel border border-line dark:border-surfaceDark-border bg-white dark:bg-surfaceDark-panel shadow-panel space-y-3">
          <h2 className="text-lg font-bold text-ink-950 dark:text-white">
            1. Multi-Modal Visual Cues & Contrast
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Emergency status, trust verification, and incident severity are never communicated through color alone. Every risk indicator combines dedicated geometric shapes (octagons, triangles, circles), explicit textual labels, and distinct color hues exceeding 4.5:1 contrast ratios.
          </p>
        </div>

        <div className="p-6 rounded-panel border border-line dark:border-surfaceDark-border bg-white dark:bg-surfaceDark-panel shadow-panel space-y-3">
          <h2 className="text-lg font-bold text-ink-950 dark:text-white">
            2. Keyboard & Assistive Device Navigation
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            All interactive queues, buttons, form fields, and map inspector drawers are fully operable via keyboard:
          </p>
          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-5">
            <li><kbd className="font-mono bg-slate-100 dark:bg-surfaceDark-raised px-1.5 py-0.5 rounded border border-line dark:border-surfaceDark-border">Tab</kbd> / <kbd className="font-mono bg-slate-100 dark:bg-surfaceDark-raised px-1.5 py-0.5 rounded border border-line dark:border-surfaceDark-border">Shift+Tab</kbd> navigates sequentially between interactive controls.</li>
            <li><kbd className="font-mono bg-slate-100 dark:bg-surfaceDark-raised px-1.5 py-0.5 rounded border border-line dark:border-surfaceDark-border">Enter</kbd> or <kbd className="font-mono bg-slate-100 dark:bg-surfaceDark-raised px-1.5 py-0.5 rounded border border-line dark:border-surfaceDark-border">Space</kbd> activates incident queue items and actions.</li>
            <li><kbd className="font-mono bg-slate-100 dark:bg-surfaceDark-raised px-1.5 py-0.5 rounded border border-line dark:border-surfaceDark-border">Escape</kbd> immediately dismisses open dialogs and drawers.</li>
            <li>A visible focus ring (<code className="font-mono text-blue-700 dark:text-blue-400">2px solid blue-700</code>) is maintained at all times.</li>
          </ul>
        </div>

        <div className="p-6 rounded-panel border border-line dark:border-surfaceDark-border bg-white dark:bg-surfaceDark-panel shadow-panel space-y-3">
          <h2 className="text-lg font-bold text-ink-950 dark:text-white">
            3. Reduced Motion & Sensory Safety
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The application honors user operating system preferences for <code className="font-mono">prefers-reduced-motion: reduce</code>. Animated beacons, map flying transitions, and pulsating badges are neutralized when reduced motion is detected.
          </p>
        </div>

        <div className="p-6 rounded-panel border border-line dark:border-surfaceDark-border bg-white dark:bg-surfaceDark-panel shadow-panel space-y-3">
          <h2 className="text-lg font-bold text-ink-950 dark:text-white">
            4. Textual Map Alternatives
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            In accordance with WCAG requirements, maps are never the exclusive interface for viewing safety data. Every incident and facility represented on Leaflet maps is simultaneously available in structured textual queue lists and table summaries.
          </p>
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
