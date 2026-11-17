import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import RescueLayout from '../layouts/RescueLayout.jsx';
import IncidentMap from '../components/IncidentMap.jsx';
import { SeverityIndicator, StatusIndicator, TrustIndicator } from '../components/ui/Indicators.jsx';
import Button from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import {
  IconActivity,
  IconMapPin,
  IconCheck,
  IconArrowRight,
  IconShieldCheck,
  IconAlertTriangle,
} from '../components/ui/Icons.jsx';

export default function RescueDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'urgent' | 'map'

  const { data: incidentsData, isLoading } = useQuery({
    queryKey: ['incidents', 'all'],
    queryFn: async () => (await api.get('/incidents')).data,
  });

  const patchIncidentInCache = (updatedIncident) => {
    queryClient.setQueriesData({ queryKey: ['incidents'] }, (old) => {
      if (!old?.incidents) return old;
      return {
        ...old,
        incidents: old.incidents.map((i) => (i._id === updatedIncident._id ? updatedIncident : i)),
      };
    });
  };

  const advanceStatusMutation = useMutation({
    mutationFn: async ({ id, status }) =>
      (await api.patch(`/incidents/${id}/status`, {
        status,
        note: `Response advanced to ${status.replace('_', ' ')} by responder unit (${user?.name || user?.organizationName})`,
      })).data,
    onSuccess: (data) => patchIncidentInCache(data.incident),
  });

  const selfAssignMutation = useMutation({
    mutationFn: async ({ id }) =>
      (await api.patch(`/incidents/${id}/status`, {
        status: 'dispatched',
        assignedTeam: user._id,
        note: `Self-assigned by verified rescue unit (${user?.name || user?.organizationName})`,
      })).data,
    onSuccess: (data) => patchIncidentInCache(data.incident),
  });

  useEffect(() => {
    if (!socket) return;
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['incidents'] });
    socket.on('incident:new', invalidate);
    socket.on('incident:update', invalidate);
    return () => {
      socket.off('incident:new', invalidate);
      socket.off('incident:update', invalidate);
    };
  }, [socket, queryClient]);

  const allIncidents = incidentsData?.incidents || [];

  const myAssignments = allIncidents.filter(
    (i) =>
      i.assignedTeam?._id === user?._id ||
      i.assignedTeam === user?._id
  );

  const unassignedUrgent = allIncidents.filter(
    (i) =>
      !i.assignedTeam &&
      ['critical', 'high'].includes(i.severity) &&
      i.status !== 'resolved' &&
      i.status !== 'rejected'
  );

  return (
    <RescueLayout>
      <div className="space-y-5">
        {/* Page Top Headline */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-surfaceDark-border">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase text-teal-400 tracking-wider mb-1">
              Field Response Operations · Unit {user?.organizationName || user?.name}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Field Response Console
            </h1>
            <p className="text-xs text-slate-400">
              Assigned rescue tasks prioritized. Immediate self-assignment available for verified units.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded text-xs font-mono uppercase font-bold bg-teal-950 text-teal-300 border border-teal-800">
              ✓ Approved Rescue Unit
            </span>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-0.5">Assigned to You</span>
            <div className="text-3xl font-bold font-mono text-blue-400">{myAssignments.length}</div>
            <span className="text-[10px] text-slate-400">Active assignments</span>
          </div>

          <div className="p-3.5 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-0.5">Urgent & Unassigned</span>
            <div className="text-3xl font-bold font-mono text-coral-400">{unassignedUrgent.length}</div>
            <span className="text-[10px] text-coral-400">Requires response team</span>
          </div>

          <div className="p-3.5 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border col-span-2 sm:col-span-1">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-0.5">Regional Incidents</span>
            <div className="text-3xl font-bold font-mono text-white">{allIncidents.length}</div>
            <span className="text-[10px] text-slate-400">Open in area</span>
          </div>
        </div>

        {/* Mobile Tab Toggles */}
        <div className="lg:hidden flex border-b border-surfaceDark-border text-xs font-mono font-semibold">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors ${
              activeTab === 'assignments'
                ? 'border-blue-400 text-white font-bold'
                : 'border-transparent text-slate-400'
            }`}
          >
            My Assignments ({myAssignments.length})
          </button>
          <button
            onClick={() => setActiveTab('urgent')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors ${
              activeTab === 'urgent'
                ? 'border-coral-400 text-white font-bold'
                : 'border-transparent text-slate-400'
            }`}
          >
            Urgent Unassigned ({unassignedUrgent.length})
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors ${
              activeTab === 'map'
                ? 'border-teal-400 text-white font-bold'
                : 'border-transparent text-slate-400'
            }`}
          >
            Map View
          </button>
        </div>

        {/* 2-Column Desktop Grid: Left Map (7 cols) | Right Assignments & Urgent (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Map Column */}
          <div
            className={`lg:col-span-7 space-y-3 ${
              activeTab === 'map' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="rounded-panel overflow-hidden border border-surfaceDark-border bg-surfaceDark-panel">
              <IncidentMap
                incidents={allIncidents}
                height="560px"
                flyToIncidentId={selectedIncidentId}
                onIncidentClick={(inc) => setSelectedIncidentId(inc._id)}
                dark={true}
              />
            </div>
          </div>

          {/* Action Lists Column */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Assigned to Unit */}
            <div
              className={`space-y-3 ${
                activeTab === 'assignments' ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-surfaceDark-border">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <IconActivity width={15} height={15} /> Assigned Tasks ({myAssignments.length})
                </span>
                <span className="text-[10px] font-mono text-slate-400">Priority Response</span>
              </div>

              {myAssignments.length === 0 ? (
                <EmptyState
                  title="No assigned incidents"
                  description="Your unit has no active incident dispatches. You can self-assign urgent tasks from the unassigned list below."
                  dark={true}
                />
              ) : (
                <div className="space-y-3">
                  {myAssignments.map((inc) => (
                    <div
                      key={inc._id}
                      onClick={() => setSelectedIncidentId(inc._id)}
                      className="p-4 rounded-panel border border-blue-900/60 bg-surfaceDark-panel space-y-3 hover:border-blue-700 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <SeverityIndicator severity={inc.severity} dark={true} />
                            <StatusIndicator status={inc.status} dark={true} />
                          </div>
                          <h4 className="text-sm font-bold text-white">{inc.title}</h4>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            📍 {inc.location?.address || 'Location on file'}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {inc.description}
                      </p>

                      <div className="pt-2 border-t border-surfaceDark-border flex items-center gap-2">
                        {inc.status !== 'resolved' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              advanceStatusMutation.mutate({ id: inc._id, status: 'resolved' });
                            }}
                            loading={advanceStatusMutation.isPending}
                            icon={<IconCheck width={14} height={14} />}
                            className="flex-1 min-h-[42px]"
                          >
                            Mark Resolved
                          </Button>
                        )}

                        <Link
                          to={`/rescue/incidents/${inc._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center px-3 py-2 text-xs font-mono font-semibold rounded-control border border-surfaceDark-border hover:bg-surfaceDark-raised text-slate-300 hover:text-white"
                        >
                          Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Unassigned & Urgent */}
            <div
              className={`space-y-3 pt-4 border-t border-surfaceDark-border ${
                activeTab === 'urgent' ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-surfaceDark-border">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-coral-400 flex items-center gap-1.5">
                  <IconAlertTriangle width={15} height={15} /> Urgent & Unassigned ({unassignedUrgent.length})
                </span>
                <span className="text-[10px] font-mono text-slate-400">Available</span>
              </div>

              {unassignedUrgent.length === 0 ? (
                <p className="p-4 text-center rounded-panel border border-dashed border-surfaceDark-border text-xs text-slate-500 font-mono">
                  No unassigned urgent incidents in the region right now.
                </p>
              ) : (
                <div className="space-y-3">
                  {unassignedUrgent.map((inc) => (
                    <div
                      key={inc._id}
                      onClick={() => setSelectedIncidentId(inc._id)}
                      className="p-4 rounded-panel border border-coral-900/40 bg-surfaceDark-panel space-y-3 hover:border-coral-800 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <SeverityIndicator severity={inc.severity} dark={true} />
                            <StatusIndicator status={inc.status} dark={true} />
                          </div>
                          <h4 className="text-sm font-bold text-white">{inc.title}</h4>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            📍 {inc.location?.address || 'Location on file'}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2">
                        {inc.description}
                      </p>

                      <div className="pt-2 border-t border-surfaceDark-border flex items-center justify-between gap-2">
                        <Button
                          size="sm"
                          variant="critical"
                          onClick={(e) => {
                            e.stopPropagation();
                            selfAssignMutation.mutate({ id: inc._id });
                          }}
                          loading={selfAssignMutation.isPending}
                          className="w-full min-h-[44px] font-mono text-xs uppercase"
                        >
                          Self-Assign Incident →
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RescueLayout>
  );
}
