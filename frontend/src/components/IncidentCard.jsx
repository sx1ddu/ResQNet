import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { SeverityIndicator, TrustIndicator, StatusIndicator } from './ui/Indicators.jsx';
import Button from './ui/Button.jsx';
import { IconCheck, IconX, IconSparkles } from './ui/Icons.jsx';

function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const AUTHORITY_ROLES = ['eoc', 'admin', 'rescue_team'];

export default function IncidentCard({
  incident,
  onClick,
  actions,
  dark = false,
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const patchIncidentInCache = (updatedIncident) => {
    queryClient.setQueriesData({ queryKey: ['incidents'] }, (old) => {
      if (!old?.incidents) return old;
      return {
        ...old,
        incidents: old.incidents.map((i) => (i._id === updatedIncident._id ? updatedIncident : i)),
      };
    });
  };

  const crowdVerify = useMutation({
    mutationFn: async (vote) =>
      (await api.post(`/incidents/${incident._id}/crowd-verify`, { vote })).data,
    onSuccess: (data) => patchIncidentInCache(data.incident),
  });

  const authorityVerify = useMutation({
    mutationFn: async (status) =>
      (await api.patch(`/incidents/${incident._id}/authority-verify`, { status })).data,
    onSuccess: (data) => patchIncidentInCache(data.incident),
  });

  const isOwnReport =
    incident.reportedBy?._id === user?._id || incident.reportedBy === user?._id;
  const myVote = incident.crowdVotes?.find(
    (v) => (v.user?._id || v.user) === user?._id
  )?.vote;
  const canActAsAuthority =
    AUTHORITY_ROLES.includes(user?.role) &&
    (user?.role !== 'rescue_team' ||
      incident.assignedTeam?._id === user?._id ||
      incident.assignedTeam === user?._id);
  const alreadyDecided = incident.authorityVerification?.status !== 'pending';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`rounded-panel p-4.5 border transition-all duration-150 ${
        dark
          ? 'bg-surfaceDark-panel border-surfaceDark-border hover:border-slate-500 text-white'
          : 'bg-white border-line hover:border-slate-300 text-slate-900 shadow-panel'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3
            className={`font-bold text-sm sm:text-base leading-snug ${
              dark ? 'text-white' : 'text-ink-950'
            }`}
          >
            {incident.title}
          </h3>
          <p
            className={`mt-1 text-xs line-clamp-2 leading-relaxed ${
              dark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {incident.description}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <SeverityIndicator severity={incident.severity} dark={dark} />
          {incident.verification && (
            <TrustIndicator verification={incident.verification} dark={dark} />
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500">
        <StatusIndicator status={incident.status} dark={dark} />
        <span className="px-1.5 py-0.5 rounded border border-line dark:border-surfaceDark-border uppercase">
          {incident.category}
        </span>
        <span className="truncate max-w-[200px]">
          📍 {incident.location?.address || 'Location on file'}
        </span>
        <span className="ml-auto shrink-0">{formatTime(incident.createdAt)}</span>
      </div>

      {incident.aiAnalysis?.summary && (
        <div
          className={`mt-2.5 pt-2 border-t text-xs italic ${
            dark
              ? 'border-surfaceDark-border text-slate-400'
              : 'border-line text-slate-600'
          }`}
        >
          <span className="font-mono not-italic font-bold text-blue-700 dark:text-blue-400 mr-1.5">
            AI Summary:
          </span>
          {incident.aiAnalysis.summary}
        </div>
      )}

      {/* Crowd Verification voting */}
      {!isOwnReport && incident.status !== 'rejected' && (
        <div
          className={`mt-3 pt-2.5 border-t flex items-center justify-between gap-2 flex-wrap text-xs ${
            dark ? 'border-surfaceDark-border' : 'border-line'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className={`font-mono text-[11px] uppercase ${
              dark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Corroborate this report?
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => crowdVerify.mutate('confirm')}
              disabled={crowdVerify.isPending}
              className={`px-2.5 py-1 rounded-control text-xs font-mono font-semibold border transition-colors flex items-center gap-1 ${
                myVote === 'confirm'
                  ? 'bg-teal-700 text-white border-teal-700'
                  : dark
                  ? 'border-surfaceDark-border text-teal-300 hover:bg-surfaceDark-raised'
                  : 'border-line text-teal-800 hover:bg-teal-50'
              }`}
            >
              <IconCheck width={12} height={12} /> Confirm
            </button>
            <button
              onClick={() => crowdVerify.mutate('dispute')}
              disabled={crowdVerify.isPending}
              className={`px-2.5 py-1 rounded-control text-xs font-mono font-semibold border transition-colors flex items-center gap-1 ${
                myVote === 'dispute'
                  ? 'bg-coral-700 text-white border-coral-700'
                  : dark
                  ? 'border-surfaceDark-border text-coral-300 hover:bg-surfaceDark-raised'
                  : 'border-line text-coral-800 hover:bg-coral-50'
              }`}
            >
              <IconX width={12} height={12} /> Dispute
            </button>
          </div>
        </div>
      )}

      {/* Authority Quick Verification (for EOC/rescue) */}
      {canActAsAuthority && !alreadyDecided && (
        <div
          className={`mt-2.5 pt-2 border-t flex items-center justify-between gap-2 flex-wrap ${
            dark ? 'border-surfaceDark-border' : 'border-line'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="font-mono text-[11px] uppercase text-slate-400">
            Authority Review:
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => authorityVerify.mutate('confirmed')}
              loading={authorityVerify.isPending}
              icon={<IconCheck width={12} height={12} />}
            >
              Confirm
            </Button>
            <Button
              size="sm"
              variant="critical"
              onClick={() => authorityVerify.mutate('rejected')}
              loading={authorityVerify.isPending}
              icon={<IconX width={12} height={12} />}
            >
              Reject
            </Button>
          </div>
        </div>
      )}

      {actions && (
        <div
          className={`mt-3 pt-2.5 border-t flex gap-2 ${
            dark ? 'border-surfaceDark-border' : 'border-line'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
