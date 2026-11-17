import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import RescueLayout from '../layouts/RescueLayout.jsx';
import IncidentMap from '../components/IncidentMap.jsx';
import IncidentTimeline from '../components/incidents/IncidentTimeline.jsx';
import { SeverityIndicator, StatusIndicator, TrustIndicator } from '../components/ui/Indicators.jsx';
import Button from '../components/ui/Button.jsx';
import { Textarea } from '../components/ui/FormField.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import {
  IconCheck,
  IconX,
  IconMapPin,
  IconPhone,
  IconSparkles,
} from '../components/ui/Icons.jsx';

export default function RescueIncidentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [authorityNote, setAuthorityNote] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['incidents', id],
    queryFn: async () => (await api.get(`/incidents/${id}`)).data,
  });

  const incident = data?.incident;

  const patchIncidentInCache = (updatedIncident) => {
    queryClient.setQueryData(['incidents', id], { incident: updatedIncident });
    queryClient.invalidateQueries({ queryKey: ['incidents'] });
  };

  const advanceStatusMutation = useMutation({
    mutationFn: async (newStatus) =>
      (await api.patch(`/incidents/${id}/status`, {
        status: newStatus,
        note: `Status updated to ${newStatus.replace('_', ' ')} by rescue team (${user?.name})`,
      })).data,
    onSuccess: (data) => patchIncidentInCache(data.incident),
  });

  const authorityVerifyMutation = useMutation({
    mutationFn: async (status) =>
      (await api.patch(`/incidents/${id}/authority-verify`, {
        status,
        note: authorityNote || `Field authority verification by responder (${user?.name})`,
      })).data,
    onSuccess: (data) => {
      setAuthorityNote('');
      patchIncidentInCache(data.incident);
    },
  });

  if (isLoading) {
    return (
      <RescueLayout>
        <p className="text-center py-16 text-xs font-mono text-slate-400">Loading response task…</p>
      </RescueLayout>
    );
  }

  if (error || !incident) {
    return (
      <RescueLayout>
        <EmptyState
          title="Incident Record Not Found"
          description="The requested response record could not be loaded."
          action={
            <Link to="/rescue">
              <Button size="sm" variant="dark">
                ← Return to Console
              </Button>
            </Link>
          }
          dark={true}
        />
      </RescueLayout>
    );
  }

  const isAssignedToMe =
    incident.assignedTeam?._id === user?._id || incident.assignedTeam === user?._id;

  return (
    <RescueLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link to="/rescue" className="text-teal-400 hover:underline">
            ← Field Console
          </Link>
          <span>/</span>
          <span>Task {incident._id.slice(-6).toUpperCase()}</span>
        </div>

        {/* Task Header */}
        <div className="p-6 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <SeverityIndicator severity={incident.severity} dark={true} />
                <StatusIndicator status={incident.status} dark={true} />
                {incident.verification && (
                  <TrustIndicator verification={incident.verification} dark={true} />
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {incident.title}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">
                📍 {incident.location?.address || 'GPS Coordinates on file'} · Category: {incident.category}
              </p>
            </div>

            {isAssignedToMe && (
              <span className="px-3 py-1 rounded-badge text-xs font-mono font-bold uppercase bg-blue-950 text-blue-300 border border-blue-800">
                Assigned to your unit
              </span>
            )}
          </div>

          <div className="pt-3 border-t border-surfaceDark-border">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 mb-1">
              Field Description
            </h3>
            <p className="text-sm leading-relaxed text-slate-200">
              {incident.description}
            </p>
          </div>
        </div>

        {/* Map */}
        <div className="h-72 rounded-panel overflow-hidden border border-surfaceDark-border bg-surfaceDark-panel">
          <IncidentMap
            incidents={[incident]}
            height="100%"
            zoom={15}
            dark={true}
            showLegend={false}
          />
        </div>

        {/* Operational Actions */}
        <div className="p-6 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-400">
            Field Response Status Transitions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {incident.status !== 'in_progress' && incident.status !== 'resolved' && (
              <Button
                size="lg"
                variant="primary"
                onClick={() => advanceStatusMutation.mutate('in_progress')}
                loading={advanceStatusMutation.isPending}
                className="w-full font-mono text-xs uppercase"
              >
                Mark In Progress →
              </Button>
            )}

            {incident.status !== 'resolved' && (
              <Button
                size="lg"
                variant="primary"
                onClick={() => advanceStatusMutation.mutate('resolved')}
                loading={advanceStatusMutation.isPending}
                icon={<IconCheck width={16} height={16} />}
                className="w-full font-mono text-xs uppercase bg-teal-700 hover:bg-teal-800 border-teal-700"
              >
                Mark Incident Resolved ✓
              </Button>
            )}

            {incident.status === 'resolved' && (
              <div className="col-span-full p-3 rounded-control text-center text-xs font-mono font-bold bg-teal-950/60 border border-teal-800 text-teal-300">
                ✓ Response task completed and resolved.
              </div>
            )}
          </div>
        </div>

        {/* Authority Verification (if assigned to current team) */}
        {isAssignedToMe && incident.authorityVerification?.status === 'pending' && (
          <div className="p-6 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400">
              On-Scene Ground Verification
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Confirm whether the reported incident is genuine and requires regional coordination or reject if unsubstantiated.
            </p>

            <Textarea
              rows={2}
              dark={true}
              value={authorityNote}
              onChange={(e) => setAuthorityNote(e.target.value)}
              placeholder="On-scene observation notes…"
              className="text-xs"
            />

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button
                size="md"
                variant="primary"
                onClick={() => authorityVerifyMutation.mutate('confirmed')}
                loading={authorityVerifyMutation.isPending}
                icon={<IconCheck width={14} height={14} />}
              >
                Verify Legitimate
              </Button>
              <Button
                size="md"
                variant="critical"
                onClick={() => authorityVerifyMutation.mutate('rejected')}
                loading={authorityVerifyMutation.isPending}
                icon={<IconX width={14} height={14} />}
              >
                Reject as Fake
              </Button>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="p-6 rounded-panel bg-surfaceDark-panel border border-surfaceDark-border space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-400">
            Task Timeline
          </h3>
          <IncidentTimeline timeline={incident.timeline} dark={true} />
        </div>
      </div>
    </RescueLayout>
  );
}
