import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axiosClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { SeverityIndicator, TrustIndicator, StatusIndicator } from '../ui/Indicators.jsx';
import Button from '../ui/Button.jsx';
import { Textarea } from '../ui/FormField.jsx';
import {
  IconCheck,
  IconX,
  IconArrowRight,
  IconSparkles,
  IconClock,
  IconShieldCheck,
  IconMapPin,
  IconUsers,
} from '../ui/Icons.jsx';

const STATUS_FLOW = ['reported', 'acknowledged', 'dispatched', 'in_progress', 'resolved'];

function getNextStatus(current) {
  const idx = STATUS_FLOW.indexOf(current);
  return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
}

export function IncidentInspector({
  incident,
  dark = true,
  onClose = null,
  isRescue = false,
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [authorityNote, setAuthorityNote] = useState('');

  const patchIncidentInCache = (updatedIncident) => {
    queryClient.setQueriesData({ queryKey: ['incidents'] }, (old) => {
      if (!old?.incidents) return old;
      return {
        ...old,
        incidents: old.incidents.map((i) => (i._id === updatedIncident._id ? updatedIncident : i)),
      };
    });
    queryClient.invalidateQueries({ queryKey: ['ai', 'situation-summary'] });
  };

  const advanceStatusMutation = useMutation({
    mutationFn: async (newStatus) =>
      (await api.patch(`/incidents/${incident._id}/status`, {
        status: newStatus,
        note: `Status updated to ${newStatus.replace('_', ' ')} by ${user?.name || user?.role}`,
      })).data,
    onSuccess: (data) => patchIncidentInCache(data.incident),
  });

  const authorityVerifyMutation = useMutation({
    mutationFn: async (status) =>
      (await api.patch(`/incidents/${incident._id}/authority-verify`, {
        status,
        note: authorityNote || `Authority verification ${status} by ${user?.name || user?.role}`,
      })).data,
    onSuccess: (data) => {
      setAuthorityNote('');
      patchIncidentInCache(data.incident);
    },
  });

  if (!incident) {
    return (
      <div
        className={`h-full flex flex-col items-center justify-center p-8 text-center rounded-panel border ${
          dark
            ? 'bg-surfaceDark-panel border-surfaceDark-border text-slate-400'
            : 'bg-white border-line text-slate-500'
        }`}
      >
        <IconMapPin width={32} height={32} className="mb-2 text-slate-400" />
        <h4 className="font-semibold text-sm mb-1">No Incident Selected</h4>
        <p className="text-xs max-w-xs leading-relaxed">
          Select an incident from the operational queue or map to inspect details and take action.
        </p>
      </div>
    );
  }

  const next = getNextStatus(incident.status);
  const canVerifyAuthority =
    ['eoc', 'admin', 'rescue_team'].includes(user?.role) &&
    (user?.role !== 'rescue_team' || incident.assignedTeam?._id === user?._id || incident.assignedTeam === user?._id);
  const authorityStatus = incident.authorityVerification?.status || 'pending';
  const detailLink = isRescue ? `/rescue/incidents/${incident._id}` : `/eoc/incidents/${incident._id}`;

  return (
    <div
      className={`rounded-panel border p-5 flex flex-col gap-4 overflow-y-auto ${
        dark
          ? 'bg-surfaceDark-panel border-surfaceDark-border text-slate-100'
          : 'bg-white border-line text-slate-900 shadow-panel'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-line dark:border-surfaceDark-border">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <SeverityIndicator severity={incident.severity} dark={dark} />
            <StatusIndicator status={incident.status} dark={dark} />
            {incident.verification && (
              <TrustIndicator verification={incident.verification} dark={dark} />
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold leading-tight mt-1">{incident.title}</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            📍 {incident.location?.address || 'Address on file'} · Category: {incident.category}
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
            aria-label="Close inspector"
          >
            <IconX width={18} height={18} />
          </button>
        )}
      </div>

      {/* Description */}
      <div>
        <p className="text-xs font-semibold uppercase text-slate-400 font-mono mb-1">
          Report Description
        </p>
        <p className="text-xs sm:text-sm leading-relaxed p-3 rounded-control bg-surfaceDark-raised/50 border border-surfaceDark-border dark:border-surfaceDark-border">
          {incident.description}
        </p>
      </div>

      {/* AI Advisory Summary */}
      {incident.aiAnalysis?.summary && (
        <div className="p-3 rounded-control border border-blue-800/60 bg-blue-950/30 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-blue-400 uppercase mb-1">
            <IconSparkles width={13} height={13} />
            <span>AI Situation Analysis (Advisory)</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{incident.aiAnalysis.summary}</p>

          {incident.aiAnalysis.recommendedResources?.length > 0 && (
            <div className="mt-2 pt-2 border-t border-blue-900/60">
              <span className="text-[10px] font-mono uppercase text-slate-400">
                Recommended Resource Deployment:
              </span>
              <ul className="mt-1 space-y-1">
                {incident.aiAnalysis.recommendedResources.map((res, i) => (
                  <li key={i} className="text-xs text-teal-300 flex items-center gap-1.5">
                    <IconCheck width={12} height={12} />
                    <span>
                      {res.qty > 1 ? `${res.qty}× ` : ''}
                      {res.name}
                    </span>
                  </li>
                ))}
              </ul>
              {incident.aiAnalysis.etaMinutes && (
                <p className="mt-1 text-[11px] font-mono text-slate-400">
                  Estimated response: <strong className="text-white">{incident.aiAnalysis.etaMinutes} minutes</strong>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Response Action: Status Advance */}
      <div className="pt-2 border-t border-line dark:border-surfaceDark-border">
        <p className="text-xs font-semibold uppercase text-slate-400 font-mono mb-2">
          Operational Response Workflow
        </p>
        {next ? (
          <Button
            size="md"
            variant="primary"
            onClick={() => advanceStatusMutation.mutate(next)}
            loading={advanceStatusMutation.isPending}
            className="w-full font-mono text-xs uppercase tracking-wider"
          >
            Advance to "{next.replace('_', ' ')}" →
          </Button>
        ) : (
          <div className="p-2.5 rounded-control text-xs font-mono text-center bg-teal-950/40 border border-teal-800 text-teal-300">
            ✓ Incident lifecycle resolved
          </div>
        )}
      </div>

      {/* Authority Verification Panel */}
      {canVerifyAuthority && (
        <div className="pt-2 border-t border-line dark:border-surfaceDark-border space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-slate-400 font-mono">
              Authority Verification
            </p>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surfaceDark-raised text-slate-300 border border-surfaceDark-border">
              Current: {authorityStatus}
            </span>
          </div>

          {authorityStatus === 'pending' ? (
            <>
              <Textarea
                rows={2}
                dark={dark}
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
                  Confirm Incident
                </Button>
                <Button
                  size="sm"
                  variant="critical"
                  onClick={() => authorityVerifyMutation.mutate('rejected')}
                  loading={authorityVerifyMutation.isPending}
                  icon={<IconX width={13} height={13} />}
                >
                  Reject as Fake
                </Button>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Authority verified as <strong>{authorityStatus}</strong> by operations.
            </p>
          )}
        </div>
      )}

      {/* Crowd Verification Tally */}
      {incident.crowdVotes?.length > 0 && (
        <div className="text-xs font-mono text-slate-400 flex items-center justify-between pt-2 border-t border-surfaceDark-border">
          <span className="flex items-center gap-1.5">
            <IconUsers width={14} height={14} /> Community input:
          </span>
          <span>
            {incident.crowdVotes.filter((v) => v.vote === 'confirm').length} confirmed ·{' '}
            {incident.crowdVotes.filter((v) => v.vote === 'dispute').length} disputed
          </span>
        </div>
      )}

      {/* Open Full Record Link */}
      <div className="pt-2 mt-auto">
        <Link
          to={detailLink}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-control text-xs font-mono font-semibold text-slate-300 hover:text-white border border-surfaceDark-border hover:bg-surfaceDark-raised transition-colors"
        >
          <span>Open Complete Incident Record</span>
          <IconArrowRight width={14} height={14} />
        </Link>
      </div>
    </div>
  );
}

export default IncidentInspector;
