import React from 'react';
import { useSocket } from '../../context/SocketContext.jsx';

export function ConnectionStatus({ dark = false }) {
  const { connected } = useSocket();

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono font-medium ${
        dark
          ? connected
            ? 'bg-teal-950/60 text-teal-300 border border-teal-800'
            : 'bg-coral-950/60 text-coral-300 border border-coral-800'
          : connected
          ? 'bg-teal-50 text-teal-800 border border-teal-200'
          : 'bg-coral-50 text-coral-800 border border-coral-200'
      }`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`w-2 h-2 rounded-full ${
          connected ? 'bg-teal-600 animate-pulse' : 'bg-coral-600'
        }`}
      />
      <span>{connected ? 'LIVE' : 'DISCONNECTED'}</span>
    </div>
  );
}

export default ConnectionStatus;
