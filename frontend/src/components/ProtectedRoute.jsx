import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { dashboardPathForRole } from '../utils/roleRouting.js';
import { IconRefreshCw } from './ui/Icons.jsx';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-paper text-slate-800 font-mono text-xs gap-3">
        <IconRefreshCw className="animate-spin text-blue-700" width={24} height={24} />
        <span>Restoring authenticated session…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }

  return children;
}
