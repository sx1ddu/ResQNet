import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import { useSocket } from '../context/SocketContext.jsx';
import EOCLayout from '../layouts/EOCLayout.jsx';
import IncidentMap from '../components/IncidentMap.jsx';
import IncidentQueueItem from '../components/incidents/IncidentQueueItem.jsx';
import IncidentInspector from '../components/incidents/IncidentInspector.jsx';
import {
  IconAlertTriangle,
  IconActivity,
  IconBuilding,
  IconSparkles,
  IconFilter,
  IconMapPin,
  IconRadio,
} from '../components/ui/Icons.jsx';

export default function EOCDashboard() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const [severityFilter, setSeverityFilter] = useState('');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [mobileActiveTab, setMobileActiveTab] = useState('queue'); // 'queue' | 'map' | 'inspector'

  const { data: incidentsData } = useQuery({
    queryKey: ['incidents', 'all'],
    queryFn: async () => (await api.get('/incidents')).data,
    refetchInterval: 30000,
  });

  const { data: facilitiesData } = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => (await api.get('/facilities')).data,
  });

  const { data: summaryData } = useQuery({
    queryKey: ['ai', 'situation-summary'],
    queryFn: async () => (await api.get('/ai/situation-summary')).data,
    refetchInterval: 20000,
  });

  // Socket updates
  useEffect(() => {
    if (!socket) return;
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['ai', 'situation-summary'] });
    };
    socket.on('incident:new', invalidate);
    socket.on('incident:update', invalidate);
    socket.on('incident:escalated', invalidate);
    return () => {
      socket.off('incident:new', invalidate);
      socket.off('incident:update', invalidate);
      socket.off('incident:escalated', invalidate);
    };
  }, [socket, queryClient]);

  const allIncidents = incidentsData?.incidents || [];
  const facilities = facilitiesData?.facilities || [];

  const filteredIncidents = allIncidents.filter(
    (i) => !severityFilter || i.severity === severityFilter
  );
  const escalatedIncidents = allIncidents.filter((i) => i.escalated);

  const selectedIncident =
    allIncidents.find((i) => i._id === selectedIncidentId) ||
    allIncidents[0] ||
    null;

  const handleSelectIncident = (id) => {
    setSelectedIncidentId(id);
    setMobileActiveTab('inspector');
  };

  return (
    <EOCLayout>
      <div className="space-y-4">
        {/* Operations Headline */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-surfaceDark-border">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase text-blue-400 tracking-wider mb-1">
              Regional Operations Command
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Emergency Command Center
            </h1>
            <p className="text-xs text-slate-400">
              Synchronized operational queue, spatial mapping, and decision triage console.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-badge text-[11px] font-mono uppercase bg-blue-950/80 text-blue-300 border border-blue-800">
              Session Live · 30s Polling Fallback
            </span>
          </div>
        </div>

        {/* 4 KPI Metric Strips */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-0.5">Open Incidents</span>
            <div className="text-2xl font-bold font-mono text-white">
              {allIncidents.filter((i) => i.status !== 'resolved').length}
            </div>
            <span className="text-[10px] text-slate-400">{allIncidents.length} total logged</span>
          </div>

          <div className="p-3.5 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-0.5">Critical & High</span>
            <div className="text-2xl font-bold font-mono text-coral-400">
              {allIncidents.filter((i) => ['critical', 'high'].includes(i.severity) && i.status !== 'resolved').length}
            </div>
            <span className="text-[10px] text-coral-400">Urgent response required</span>
          </div>

          <div className="p-3.5 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-0.5">Escalated Reports</span>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {escalatedIncidents.length}
            </div>
            <span className="text-[10px] text-amber-400">High trust, pending dispatch</span>
          </div>

          <div className="p-3.5 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-0.5">Facilities Listed</span>
            <div className="text-2xl font-bold font-mono text-teal-400">
              {facilities.length}
            </div>
            <span className="text-[10px] text-teal-400">Hospitals & shelters</span>
          </div>
        </div>

        {/* AI Situation Summary Banner */}
        {summaryData?.summary && (
          <div className="p-3.5 rounded-panel border border-blue-800/60 bg-blue-950/40 text-xs flex items-start gap-3 text-slate-200">
            <IconSparkles width={18} height={18} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono text-[10px] font-bold uppercase text-blue-400 block mb-0.5">
                Deterministic Situation Summary:
              </span>
              <p className="leading-relaxed">{summaryData.summary}</p>
            </div>
          </div>
        )}

        {/* Escalated Incidents Banner */}
        {escalatedIncidents.length > 0 && (
          <div className="p-3 rounded-panel bg-coral-950/50 border border-coral-800 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-coral-200">
              <IconAlertTriangle width={16} height={16} className="text-coral-400 shrink-0" />
              <span className="font-mono font-bold uppercase">
                Attention: {escalatedIncidents.length} escalated incident(s) require immediate dispatch
              </span>
            </div>
            <div className="flex gap-2">
              {escalatedIncidents.slice(0, 2).map((inc) => (
                <button
                  key={inc._id}
                  onClick={() => handleSelectIncident(inc._id)}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-coral-900/60 text-coral-200 border border-coral-700 hover:bg-coral-800"
                >
                  Locate: {inc.title.slice(0, 20)}…
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Responsive Mobile Tab Bar */}
        <div className="lg:hidden flex border-b border-surfaceDark-border text-xs font-mono font-semibold">
          <button
            onClick={() => setMobileActiveTab('queue')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors ${
              mobileActiveTab === 'queue'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400'
            }`}
          >
            Queue ({filteredIncidents.length})
          </button>
          <button
            onClick={() => setMobileActiveTab('map')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors ${
              mobileActiveTab === 'map'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400'
            }`}
          >
            Regional Map
          </button>
          <button
            onClick={() => setMobileActiveTab('inspector')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors ${
              mobileActiveTab === 'inspector'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400'
            }`}
          >
            Inspector
          </button>
        </div>

        {/* Desktop 3-Column Layout: Queue (320px) | Map (Flex) | Inspector (360px) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Column 1: Incident Queue */}
          <div
            className={`lg:col-span-4 xl:col-span-3 space-y-3 ${
              mobileActiveTab === 'queue' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="p-3.5 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-surfaceDark-border">
                <span className="text-xs font-mono font-bold uppercase text-slate-300">
                  Incident Queue ({filteredIncidents.length})
                </span>
                <span className="text-[10px] font-mono text-slate-400">Filter Risk</span>
              </div>

              {/* Severity filter chips */}
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { label: 'All', value: '' },
                  { label: 'Critical', value: 'critical' },
                  { label: 'High', value: 'high' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Low', value: 'low' },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => setSeverityFilter(chip.value)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase transition-colors border ${
                      severityFilter === chip.value
                        ? 'bg-blue-700 text-white border-blue-700 font-bold'
                        : 'border-surfaceDark-border text-slate-400 hover:text-white hover:bg-surfaceDark-raised'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Incident Items */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredIncidents.map((incident) => (
                  <IncidentQueueItem
                    key={incident._id}
                    incident={incident}
                    isSelected={selectedIncident?._id === incident._id}
                    onClick={() => handleSelectIncident(incident._id)}
                    dark={true}
                  />
                ))}

                {filteredIncidents.length === 0 && (
                  <p className="text-center py-10 text-xs font-mono text-slate-400 border border-dashed border-surfaceDark-border rounded-control">
                    No incidents match this filter.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Regional Map */}
          <div
            className={`lg:col-span-4 xl:col-span-5 space-y-3 ${
              mobileActiveTab === 'map' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="rounded-panel overflow-hidden border border-surfaceDark-border bg-surfaceDark-panel">
              <IncidentMap
                incidents={filteredIncidents}
                facilities={facilities}
                height="620px"
                flyToIncidentId={selectedIncident?._id}
                onIncidentClick={(inc) => handleSelectIncident(inc._id)}
                dark={true}
              />
            </div>
          </div>

          {/* Column 3: Selected Incident Inspector */}
          <div
            className={`lg:col-span-4 space-y-3 ${
              mobileActiveTab === 'inspector' ? 'block' : 'hidden lg:block'
            }`}
          >
            <IncidentInspector
              incident={selectedIncident}
              dark={true}
              onClose={() => setMobileActiveTab('queue')}
            />
          </div>
        </div>
      </div>
    </EOCLayout>
  );
}
