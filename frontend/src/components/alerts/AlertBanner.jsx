import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosClient.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { IconAlertTriangle, IconAlertCircle, IconInfo, IconX } from '../ui/Icons.jsx';

export function AlertBanner({ dark = false }) {
  const { socket } = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [dismissedLocally, setDismissedLocally] = useState(new Set());

  const { data } = useQuery({
    queryKey: ['alerts', 'active'],
    queryFn: async () => (await api.get('/alerts/active')).data,
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (data?.alerts) setAlerts(data.alerts);
  }, [data]);

  useEffect(() => {
    if (!socket) return;
    const onNew = (alert) => setAlerts((prev) => [alert, ...prev]);
    const onDismissed = ({ _id }) => setAlerts((prev) => prev.filter((a) => a._id !== _id));
    socket.on('alert:new', onNew);
    socket.on('alert:dismissed', onDismissed);
    return () => {
      socket.off('alert:new', onNew);
      socket.off('alert:dismissed', onDismissed);
    };
  }, [socket]);

  const visibleAlerts = alerts.filter((a) => !dismissedLocally.has(a._id));
  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4" role="region" aria-label="Active emergency alerts">
      {visibleAlerts.map((alert) => {
        const isCritical = alert.severity === 'critical';
        const isWarning = alert.severity === 'warning';

        return (
          <div
            key={alert._id}
            className={`flex items-start justify-between gap-3 p-3.5 rounded-panel border transition-all ${
              isCritical
                ? dark
                  ? 'bg-coral-950/70 border-coral-800 text-coral-100'
                  : 'bg-coral-100 border-coral-300 text-coral-900'
                : isWarning
                ? dark
                  ? 'bg-amber-950/70 border-amber-800 text-amber-100'
                  : 'bg-amber-100 border-amber-300 text-amber-900'
                : dark
                ? 'bg-blue-950/70 border-blue-800 text-blue-100'
                : 'bg-blue-100 border-blue-300 text-blue-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5">
                {isCritical ? (
                  <IconAlertTriangle width={18} height={18} />
                ) : isWarning ? (
                  <IconAlertCircle width={18} height={18} />
                ) : (
                  <IconInfo width={18} height={18} />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                    {alert.severity} Emergency Broadcast
                  </span>
                </div>
                <p className="mt-0.5 text-xs sm:text-sm font-medium leading-relaxed">
                  {alert.message}
                </p>
              </div>
            </div>

            <button
              onClick={() => setDismissedLocally((prev) => new Set(prev).add(alert._id))}
              className="p-1 rounded hover:bg-black/10 transition-colors shrink-0"
              aria-label="Dismiss alert banner"
            >
              <IconX width={16} height={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default AlertBanner;
