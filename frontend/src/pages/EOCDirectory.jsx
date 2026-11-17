import React from 'react';
import EOCLayout from '../layouts/EOCLayout.jsx';
import EmergencyDirectory from '../components/EmergencyDirectory.jsx';

export default function EOCDirectory() {
  return (
    <EOCLayout>
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-mono font-bold uppercase text-blue-400 tracking-wider mb-1">
            Regional Coordination Resources
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Emergency Organization Directory
          </h1>
          <p className="text-xs text-slate-400">
            Registered medical facilities, disaster relief shelters, rescue units, and non-profit responders.
          </p>
        </div>

        <EmergencyDirectory dark={true} />
      </div>
    </EOCLayout>
  );
}
