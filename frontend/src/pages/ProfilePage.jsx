import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import CitizenLayout from '../layouts/CitizenLayout.jsx';
import EOCLayout from '../layouts/EOCLayout.jsx';
import RescueLayout from '../layouts/RescueLayout.jsx';
import FacilityLayout from '../layouts/FacilityLayout.jsx';
import { IconShieldCheck, IconPhone, IconBuilding, IconCheck, IconAlertCircle } from '../components/ui/Icons.jsx';

export default function ProfilePage() {
  const { user } = useAuth();

  const isDark = ['eoc', 'admin', 'rescue_team'].includes(user?.role);

  const content = (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div>
        <div className="text-[11px] font-mono font-bold uppercase text-blue-700 dark:text-blue-400 tracking-wider mb-1">
          Account Governance
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-950 dark:text-white tracking-tight">
          User & Organization Profile
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Authenticated credentials, assigned role permissions, and organization verification status.
        </p>
      </div>

      <div className="p-6 rounded-panel border border-line dark:border-surfaceDark-border bg-white dark:bg-surfaceDark-panel shadow-panel space-y-4">
        <div className="flex items-start justify-between pb-4 border-b border-line dark:border-surfaceDark-border">
          <div>
            <h2 className="text-xl font-bold text-ink-950 dark:text-white">{user?.name}</h2>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
          </div>
          <span className="px-2.5 py-1 rounded text-xs font-mono uppercase font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {user?.role?.replace('_', ' ')}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-2 border-b border-line dark:border-surfaceDark-border">
            <span className="text-slate-500 font-mono">Organization Name:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {user?.organizationName || 'None (Individual Account)'}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-line dark:border-surfaceDark-border">
            <span className="text-slate-500 font-mono">Contact Phone:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {user?.phone || 'Not provided'}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-line dark:border-surfaceDark-border">
            <span className="text-slate-500 font-mono">Accreditation / Document Status:</span>
            <span className="font-semibold font-mono uppercase">
              {user?.verificationDocument?.status ? (
                <span className={user.verificationDocument.status === 'approved' ? 'text-teal-600' : 'text-amber-600'}>
                  {user.verificationDocument.status}
                </span>
              ) : (
                <span className="text-slate-400">Standard / Verified</span>
              )}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-line dark:border-surfaceDark-border">
            <span className="text-slate-500 font-mono">Account ID:</span>
            <span className="font-mono text-slate-400">{user?._id}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-control bg-slate-50 dark:bg-surfaceDark-raised border border-line dark:border-surfaceDark-border text-xs text-slate-500 dark:text-slate-400 leading-normal">
          <strong>Read-Only Notice:</strong> In-app profile editing, password changes, and notification preferences require future backend mutation endpoints. Contact system administrator for credential updates.
        </div>
      </div>
    </div>
  );

  if (['eoc', 'admin'].includes(user?.role)) return <EOCLayout>{content}</EOCLayout>;
  if (user?.role === 'rescue_team') return <RescueLayout>{content}</RescueLayout>;
  if (['hospital', 'shelter'].includes(user?.role)) {
    return <FacilityLayout facilityType={user.role}>{content}</FacilityLayout>;
  }
  return <CitizenLayout>{content}</CitizenLayout>;
}
