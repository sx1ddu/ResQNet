import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import EOCLayout from '../layouts/EOCLayout.jsx';
import IncidentMap from '../components/IncidentMap.jsx';
import IncidentTimeline from '../components/incidents/IncidentTimeline.jsx';
import TrustBreakdown from '../components/incidents/TrustBreakdown.jsx';
import { SeverityIndicator, TrustIndicator, StatusIndicator } from '../components/ui/Indicators.jsx';
import Button from '../components/ui/Button.jsx';
import { Textarea } from '../components/ui/FormField.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import {
  IconArrowRight,
  IconCheck,
  IconX,
  IconSparkles,
  IconMapPin,
  IconUsers,
  IconClock,
} from '../components/ui/Icons.jsx';

const STATUS_OPTIONS = ['reported', 'acknowledged', 'dispatched', 'in_progress', 'resolved', 'merged', 'rejected'];

export default function EOCIncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [authorityNote, setAuthorityNote] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['incidents', id],
    queryFn: async () => (await api.get(`/incidents/${id}`)).data,
  });

  const incident = data?.incident;

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus) =>
      (await api.patch(`/incidents/${id}/status`, {
        status: newStatus,
        note: `Status updated to ${newStatus.replace('_', ' ')} by EOC command`,
      })).data,
    onSuccess: (res) => {
      queryClient.setQueryData(['incidents', id], { incident: res.incident });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });

  const authorityVerifyMutation = useMutation({
    mutationFn: async (status) =>
      (await api.patch(`/incidents/${id}/authority-verify`, {
        status,
        note: authorityNote || `Authority verification marked as ${status} by EOC command`,
      })).data,
    onSuccess: (res) => {
      setAuthorityNote('');
      queryClient.setQueryData(['incidents', id], { incident: res.incident });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });

  if (isLoading) {
    return (
      <EOCLayout>
        <p className="text-center py-16 text-xs font-mono text-slate-400">Loading incident detail record…</p>
      </EOCLayout>
    );
  }

  if (error || !incident) {
    return (
      <EOCLayout>
        <EmptyState
          title="Incident Record Not Found"
          description="The requested incident could not be found or you may not have authorization to view it."
          action={
            <Link to="/eoc">
              <Button size="sm" variant="dark">
                ← Return to Command Center
              </Button>
            </Link>
          }
          dark={true}
        />
      </EOCLayout>
    );
  }

  return (
    <EOCLayout>
      <div className="space-y-6">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-surfaceDark-border">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs font-mono">
              <Link to="/eoc" className="text-blue-400 hover:underline">
                ← Command Center
              </Link>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">Incident {incident._id.slice(-6).toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {incident.title}
              </h1>
              <SeverityIndicator severity={incident.severity} dark={true} />
              <StatusIndicator status={incident.status} dark={true} />
              {incident.verification && (
                <TrustIndicator verification={incident.verification} dark={true} />
              )}
            </div>

            <p className="mt-1 text-xs text-slate-400 font-mono">
              Category: <span className="uppercase text-slate-300 font-bold">{incident.category}</span> ·{' '}
              📍 {incident.location?.address || 'Coordinates on file'} · Reported by citizen
            </p>
          </div>
        </div>

        {/* 2-Column Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Overview, Map, Trust Breakdown, Timeline */}
          <div className="lg:col-span-8 space-y-6">
            {/* Overview & Map */}
            <div className="p-5 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Incident Description & Geographic Mapping
              </h3>
              <p className="text-sm leading-relaxed text-slate-200 p-3 rounded-control bg-surfaceDark-raised/50 border border-surfaceDark-border">
                {incident.description}
              </p>

              <div className="h-64 rounded-control overflow-hidden border border-surfaceDark-border">
                <IncidentMap
                  incidents={[incident]}
                  height="100%"
                  zoom={15}
                  dark={true}
                  showLegend={false}
                />
              </div>
            </div>

            {/* Verification Evidence Breakdown */}
            {incident.verification && (
              <TrustBreakdown verification={incident.verification} dark={true} />
            )}

            {/* Timeline */}
            <div className="p-5 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Audit Timeline & Action Log
              </h3>
              <IncidentTimeline timeline={incident.timeline} dark={true} />
            </div>
          </div>

          {/* Right Column (4 cols): Response Controls, Authority Verification, AI Analysis */}
          <div className="lg:col-span-4 space-y-5">
            {/* Operational Status Action */}
            <div className="p-5 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Response Status Workflow
              </h3>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 font-mono mb-1.5">
                  Update Incident Status:
                </label>
                <select
                  value={selectedStatus || incident.status}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-control bg-surfaceDark-raised border border-surfaceDark-border text-white focus:outline-none focus:ring-1 focus:ring-blue-700"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                size="md"
                variant="primary"
                onClick={() => updateStatusMutation.mutate(selectedStatus || incident.status)}
                loading={updateStatusMutation.isPending}
                className="w-full font-mono text-xs uppercase"
              >
                Save Status Transition
              </Button>
            </div>

            {/* Authority Verification Panel */}
            <div className="p-5 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Authority Review
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surfaceDark-raised text-slate-300">
                  {incident.authorityVerification?.status || 'pending'}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-normal">
                EOC confirmation verifies report authenticity for high-priority emergency response.
              </p>

              <Textarea
                rows={2}
                dark={true}
                value={authorityNote}
                onChange={(e) => setAuthorityNote(e.target.value)}
                placeholder="Optional authority review note…"
                className="text-xs"
              />

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => authorityVerifyMutation.mutate('confirmed')}
                  loading={authorityVerifyMutation.isPending}
                  icon={<IconCheck width={13} height={13} />}
                >
                  Confirm Valid
                </Button>
                <Button
                  size="sm"
                  variant="critical"
                  onClick={() => authorityVerifyMutation.mutate('rejected')}
                  loading={authorityVerifyMutation.isPending}
                  icon={<IconX width={13} height={13} />}
                >
                  Reject Fake
                </Button>
              </div>
            </div>

            {/* AI Advisory Triage Summary */}
            {incident.aiAnalysis && (
              <div className="p-5 rounded-panel bg-surfaceDark-panel border border-blue-900/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-blue-400 flex items-center gap-1.5">
                    <IconSparkles width={14} height={14} /> AI Analysis
                  </span>
                  <span className="text-[10px] font-mono text-blue-300">
                    Confidence: {incident.aiAnalysis.confidence ?? 'N/A'}%
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{incident.aiAnalysis.summary}"
                </p>

                {incident.aiAnalysis.recommendedResources?.length > 0 && (
                  <div className="pt-2 border-t border-blue-950 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Recommended Units:
                    </span>
                    {incident.aiAnalysis.recommendedResources.map((res, i) => (
                      <p key={i} className="text-xs text-teal-300">
                        • {res.qty}× {res.name}
                      </p>
                    ))}
                    {incident.aiAnalysis.etaMinutes && (
                      <p className="text-[11px] font-mono text-slate-400 mt-1">
                        Est. Transit Time: <span className="text-white">{incident.aiAnalysis.etaMinutes} mins</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </EOCLayout>
  );
}
