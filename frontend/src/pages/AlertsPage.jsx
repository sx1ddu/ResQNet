import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import CitizenLayout from '../layouts/CitizenLayout.jsx';
import EOCLayout from '../layouts/EOCLayout.jsx';
import RescueLayout from '../layouts/RescueLayout.jsx';
import FacilityLayout from '../layouts/FacilityLayout.jsx';
import {
  IconAlertTriangle,
  IconAlertCircle,
  IconInfo,
  IconRadio,
  IconClock,
} from '../components/ui/Icons.jsx';

export default function AlertsPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['alerts', 'active'],
    queryFn: async () => (await api.get('/alerts/active')).data,
    refetchInterval: 30000,
  });

  const alerts = data?.alerts || [];

  const content = (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div>
        <div className="text-[11px] font-mono font-bold uppercase text-coral-700 dark:text-coral-400 tracking-wider mb-1">
          Public Safety Broadcasts
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-950 dark:text-white tracking-tight">
          Active Emergency Alerts
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Official bulletins and high-priority public warnings currently active across the regional network.
        </p>
      </div>

      <div className="p-3.5 rounded-panel border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 text-xs text-blue-900 dark:text-blue-300 font-mono">
        ℹ Showing up to 5 latest active broadcasts. Historical dismissed alerts are not archived in this build.
      </div>

      {isLoading && (
        <p className="text-center py-12 text-xs font-mono text-slate-500">Checking active emergency broadcasts…</p>
      )}

      <div className="space-y-4">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';

          return (
            <div
              key={alert._id}
              className={`p-5 rounded-panel border space-y-3 ${
                isCritical
                  ? 'bg-coral-50/80 dark:bg-coral-950/50 border-coral-300 dark:border-coral-800 text-coral-950 dark:text-coral-100'
                  : isWarning
                  ? 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                  : 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="shrink-0">
                    {isCritical ? (
                      <IconAlertTriangle width={18} height={18} className="text-coral-700 dark:text-coral-400" />
                    ) : isWarning ? (
                      <IconAlertCircle width={18} height={18} className="text-amber-700 dark:text-amber-400" />
                    ) : (
                      <IconInfo width={18} height={18} className="text-blue-700 dark:text-blue-400" />
                    )}
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">
                    {alert.severity} Priority Broadcast
                  </span>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-white/70 dark:bg-black/30 border border-current">
                  ACTIVE
                </span>
              </div>

              <p className="text-sm sm:text-base font-semibold leading-relaxed">
                {alert.message}
              </p>

              <div className="pt-2 border-t border-current/20 flex items-center justify-between text-xs font-mono opacity-80">
                <span>Issued by Mumbai EOC Command</span>
                <span>Broadcast ID: {alert._id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          );
        })}

        {!isLoading && alerts.length === 0 && (
          <div className="p-12 text-center rounded-panel border border-dashed border-line dark:border-surfaceDark-border bg-white dark:bg-surfaceDark-panel space-y-2">
            <IconRadio width={32} height={32} className="mx-auto text-teal-600" />
            <h3 className="text-base font-bold text-ink-950 dark:text-white">No Active Alerts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              There are currently no active high-risk emergency broadcasts in your area. Follow standard preparedness guidance.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Wrap in appropriate layout depending on authenticated role
  if (!user) return <PublicLayout>{content}</PublicLayout>;
  if (['eoc', 'admin'].includes(user.role)) return <EOCLayout>{content}</EOCLayout>;
  if (user.role === 'rescue_team') return <RescueLayout>{content}</RescueLayout>;
  if (['hospital', 'shelter'].includes(user.role)) {
    return <FacilityLayout facilityType={user.role}>{content}</FacilityLayout>;
  }
  return <CitizenLayout>{content}</CitizenLayout>;
}
