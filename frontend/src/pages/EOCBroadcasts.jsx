import React from 'react';
import EOCLayout from '../layouts/EOCLayout.jsx';
import IssueAlertPanel from '../components/IssueAlertPanel.jsx';

export default function EOCBroadcasts() {
  return (
    <EOCLayout>
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-mono font-bold uppercase text-blue-400 tracking-wider mb-1">
            Crisis Communications
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Emergency Broadcast Management
          </h1>
          <p className="text-xs text-slate-400">
            Compose and transmit real-time alerts across all citizen, responder, and facility dashboards.
          </p>
        </div>

        <div className="max-w-3xl">
          <IssueAlertPanel dark={true} />
        </div>
      </div>
    </EOCLayout>
  );
}
