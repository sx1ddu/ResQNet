import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import Button from '../components/ui/Button.jsx';
import {
  IconArrowRight,
  IconShieldCheck,
  IconAlertOctagon,
  IconActivity,
  IconBuilding,
  IconUsers,
  IconSparkles,
} from '../components/ui/Icons.jsx';

export default function Landing() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-mono font-bold uppercase tracking-wider">
              <span>●</span>
              <span>Civic Response Command</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-ink-950 tracking-tight leading-[1.12]">
              When every minute matters, clarity brings people together.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              ResQNet unites citizens, emergency operations teams, verified rescue units, hospitals, and relief shelters around one coordinated view of reported emergencies and available capacity.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link to="/citizen/report">
                <Button size="lg" variant="critical" icon={<IconAlertOctagon width={18} height={18} />} className="w-full sm:w-auto shadow-md">
                  Report an Emergency →
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Sign In to Operations
                </Button>
              </Link>
            </div>

            <p className="text-xs text-slate-500 font-mono flex items-center gap-2 pt-1">
              <span>ℹ</span>
              <span>Designed for coordination. For life-threatening emergencies, dial 112 directly.</span>
            </p>
          </div>

          {/* Right Column: Operations Interface Preview */}
          <div className="lg:col-span-5">
            <div className="rounded-panel p-5 bg-ink-900 border border-ink-700 text-white shadow-preview space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-ink-700 text-xs font-mono">
                <span className="font-bold tracking-wider text-blue-300">RESQNET / REGIONAL COMMAND</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[10px] uppercase font-mono">
                  LIVE OVERVIEW
                </span>
              </div>

              {/* Snapshot Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-control bg-surfaceDark-panel border border-surfaceDark-border">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Active Incidents</span>
                  <span className="text-3xl font-bold font-mono text-white">18</span>
                  <span className="text-[11px] text-coral-400 block mt-0.5">04 High Priority</span>
                </div>
                <div className="p-3.5 rounded-control bg-surfaceDark-panel border border-surfaceDark-border">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Listed Facilities</span>
                  <span className="text-3xl font-bold font-mono text-white">24</span>
                  <span className="text-[11px] text-teal-400 block mt-0.5">18 Operational</span>
                </div>
              </div>

              {/* Illustrative Map Block */}
              <div className="relative h-44 rounded-control overflow-hidden border border-surfaceDark-border bg-ink-950 flex flex-col justify-between p-3.5 bg-gradient-to-br from-ink-950 to-surfaceDark-panel">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>REGIONAL MAPPING</span>
                  <span className="text-teal-400">● REALTIME SYNC</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-coral-500 animate-ping" />
                    <span className="font-semibold text-slate-200 truncate">Water rising near underpass</span>
                    <span className="ml-auto font-mono text-[10px] text-coral-400">Critical</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-semibold text-slate-300 truncate">Power line down across roadway</span>
                    <span className="ml-auto font-mono text-[10px] text-amber-400">High</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-surfaceDark-border">
                  OSM Tile Layer · Verified Trust Signals
                </div>
              </div>

              <div className="p-3 rounded-control bg-blue-950/40 border border-blue-900/60 text-xs text-blue-200 flex items-center gap-2">
                <IconSparkles width={16} height={16} className="text-blue-400 shrink-0" />
                <span>AI advisory triage previews incident category, severity, and resources.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Segmentation Section */}
      <section className="bg-white border-y border-line py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-2xl">
            <div className="text-xs font-mono font-bold uppercase text-blue-700 tracking-wider mb-2">
              One Network, Purpose-Built Roles
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-ink-950 tracking-tight">
              Designed around the people who respond.
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Every participant accesses an interface customized specifically for their operational responsibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-panel border border-line bg-paper hover:border-slate-300 transition-all space-y-3">
              <span className="w-10 h-10 rounded-control bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <IconUsers width={20} height={20} />
              </span>
              <h3 className="text-lg font-bold text-ink-950">Citizens & Communities</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Submit SOS reports with verified location provenance, track status progress in real-time, locate nearby emergency shelters, and view active public safety broadcasts.
              </p>
            </div>

            <div className="p-6 rounded-panel border border-line bg-paper hover:border-slate-300 transition-all space-y-3">
              <span className="w-10 h-10 rounded-control bg-ink-950 text-white flex items-center justify-center font-bold">
                <IconActivity width={20} height={20} />
              </span>
              <h3 className="text-lg font-bold text-ink-950">Emergency Operations (EOC)</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Command center triage combining queue feeds, Leaflet regional maps, trust score signals, AI classification advisory previews, authority verification, and global broadcast control.
              </p>
            </div>

            <div className="p-6 rounded-panel border border-line bg-paper hover:border-slate-300 transition-all space-y-3">
              <span className="w-10 h-10 rounded-control bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <IconBuilding width={20} height={20} />
              </span>
              <h3 className="text-lg font-bold text-ink-950">Responders & Facilities</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Mobile-first rescue team assignment workflows, self-assignment for approved units, and live capacity management for hospitals (beds) and shelters (occupants).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent 4-Step Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="p-8 sm:p-12 rounded-panel border border-line bg-white shadow-panel grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-mono font-bold uppercase text-blue-700 tracking-wider">
              Transparent Operations
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-950 tracking-tight">
              From first report to verified response.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every status advance and verification step is permanently logged in the incident audit timeline. Trust signals separate machine suggestions from human ground truth.
            </p>
            <Link to="/register">
              <Button size="md" variant="primary">
                Join the Response Network →
              </Button>
            </Link>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-control border border-line bg-paper">
              <span className="font-mono text-xs font-bold text-blue-700 block mb-1">01 · REPORT</span>
              <p className="text-xs font-semibold text-ink-950">Citizen shares essentials</p>
              <p className="text-[11px] text-slate-500 mt-1">
                SOS or standard report with captured location provenance and optional photos.
              </p>
            </div>

            <div className="p-4 rounded-control border border-line bg-paper">
              <span className="font-mono text-xs font-bold text-blue-700 block mb-1">02 · REVIEW</span>
              <p className="text-xs font-semibold text-ink-950">Operations inspect & verify</p>
              <p className="text-[11px] text-slate-500 mt-1">
                EOC evaluates composite trust scores (GPS, crowd votes, authority verification, and NLP).
              </p>
            </div>

            <div className="p-4 rounded-control border border-line bg-paper">
              <span className="font-mono text-xs font-bold text-blue-700 block mb-1">03 · RESPOND</span>
              <p className="text-xs font-semibold text-ink-950">Rescue teams progress work</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Assigned teams advance status from dispatched to in-progress and resolved.
              </p>
            </div>

            <div className="p-4 rounded-control border border-line bg-paper">
              <span className="font-mono text-xs font-bold text-blue-700 block mb-1">04 · UPDATE</span>
              <p className="text-xs font-semibold text-ink-950">Facilities update live capacity</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Hospitals and shelters broadcast occupancy changes instantly over Socket.IO.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
