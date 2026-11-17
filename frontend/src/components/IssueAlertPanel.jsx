import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import Button from './ui/Button.jsx';
import Dialog from './ui/Dialog.jsx';
import { IconRadio, IconAlertTriangle, IconAlertCircle, IconInfo, IconX } from './ui/Icons.jsx';

const SEVERITIES = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'critical', label: 'Critical Alert' },
];

export default function IssueAlertPanel({ dark = true }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('warning');
  const [confirmCriticalModal, setConfirmCriticalModal] = useState(false);

  const { data } = useQuery({
    queryKey: ['alerts', 'active'],
    queryFn: async () => (await api.get('/alerts/active')).data,
  });

  const issueMutation = useMutation({
    mutationFn: async () => (await api.post('/alerts', { message, severity })).data,
    onSuccess: () => {
      setMessage('');
      setConfirmCriticalModal(false);
      queryClient.invalidateQueries({ queryKey: ['alerts', 'active'] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async (id) => (await api.patch(`/alerts/${id}/dismiss`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts', 'active'] }),
  });

  const handlePublishClick = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (severity === 'critical') {
      setConfirmCriticalModal(true);
    } else {
      issueMutation.mutate();
    }
  };

  const activeAlerts = data?.alerts || [];
  const charsRemaining = 500 - message.length;

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
          <IconRadio width={14} height={14} />
        </span>
        <h3 className="text-sm font-bold uppercase tracking-wide font-mono">
          Emergency Public Broadcast
        </h3>
      </div>
      <p
        className={`text-xs mb-3.5 leading-relaxed ${
          dark ? 'text-slate-400' : 'text-slate-600'
        }`}
      >
        Transmits an immediate banner notification to all connected citizen, rescue, and facility dashboards across the network.
      </p>

      <form onSubmit={handlePublishClick} className="space-y-3">
        {/* Severity selection chips */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold font-mono text-slate-400">Severity:</span>
          <div className="flex gap-1.5">
            {SEVERITIES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSeverity(s.value)}
                className={`px-3 py-1 rounded-control text-xs font-mono font-semibold border transition-colors ${
                  severity === s.value
                    ? s.value === 'critical'
                      ? 'bg-coral-700 text-white border-coral-700'
                      : s.value === 'warning'
                      ? 'bg-amber-700 text-white border-amber-700'
                      : 'bg-blue-700 text-white border-blue-700'
                    : dark
                    ? 'border-surfaceDark-border text-slate-400 hover:text-white'
                    : 'border-line text-slate-600 hover:text-ink-950'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 500))}
            rows={3}
            placeholder="What is happening, where is the danger, and what specific action should the public take?"
            className={`w-full p-3 text-xs sm:text-sm rounded-control border focus:outline-none focus:ring-2 focus:ring-blue-700/20 ${
              dark
                ? 'bg-surfaceDark-raised border-surfaceDark-border text-white placeholder:text-slate-500'
                : 'bg-white border-line text-slate-900 placeholder:text-slate-400'
            }`}
          />
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1">
            <span>Broadcasts globally to all active sessions</span>
            <span className={charsRemaining < 50 ? 'text-coral-500 font-bold' : ''}>
              {charsRemaining} chars left
            </span>
          </div>
        </div>

        {/* Live Broadcast Preview */}
        {message.trim() && (
          <div
            className={`p-3 rounded-control border ${
              severity === 'critical'
                ? dark
                  ? 'bg-coral-950/40 border-coral-800 text-coral-100'
                  : 'bg-coral-50 border-coral-200 text-coral-900'
                : severity === 'warning'
                ? dark
                  ? 'bg-amber-950/40 border-amber-800 text-amber-100'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
                : dark
                ? 'bg-blue-950/40 border-blue-800 text-blue-100'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold mb-1">
              <IconRadio width={12} height={12} /> Live Preview:
            </div>
            <p className="text-xs font-medium">{message}</p>
          </div>
        )}

        <Button
          type="submit"
          size="md"
          variant={severity === 'critical' ? 'critical' : 'primary'}
          disabled={issueMutation.isPending || !message.trim()}
          loading={issueMutation.isPending}
          className="w-full font-mono text-xs uppercase"
        >
          Publish Broadcast Alert
        </Button>
      </form>

      {/* Confirmation Dialog for Critical Broadcast */}
      <Dialog
        isOpen={confirmCriticalModal}
        onClose={() => setConfirmCriticalModal(false)}
        title="Confirm Critical Emergency Broadcast"
        description="Critical alerts are high-priority notifications that immediately trigger visual warnings across all civilian and responder consoles."
        dark={dark}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-control bg-coral-950/60 border border-coral-800 text-coral-200 text-xs">
            <strong>Message to broadcast:</strong>
            <p className="mt-1 font-medium">{message}</p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant={dark ? 'outlineDark' : 'secondary'}
              size="sm"
              onClick={() => setConfirmCriticalModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="critical"
              size="sm"
              onClick={() => issueMutation.mutate()}
              loading={issueMutation.isPending}
            >
              Confirm & Publish Now
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Active Broadcasts Queue */}
      {activeAlerts.length > 0 && (
        <div className="mt-5 pt-4 border-t border-line dark:border-surfaceDark-border space-y-2.5">
          <p className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Active Broadcasts ({activeAlerts.length})
          </p>
          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-3 rounded-control border flex items-center justify-between gap-3 ${
                  dark ? 'bg-surfaceDark-raised border-surfaceDark-border' : 'bg-slate-50 border-line'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        alert.severity === 'critical'
                          ? 'bg-coral-950 text-coral-300 border border-coral-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">ACTIVE</span>
                  </div>
                  <p className="text-xs truncate">{alert.message}</p>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dismissMutation.mutate(alert._id)}
                  loading={dismissMutation.isPending}
                  className="text-coral-500 hover:text-coral-400 shrink-0 font-mono text-[11px]"
                >
                  Dismiss / Retract
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
