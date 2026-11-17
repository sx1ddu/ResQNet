import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { dashboardPathForRole } from '../utils/roleRouting.js';
import ConnectionStatus from './ui/ConnectionStatus.jsx';
import { IconLogOut } from './ui/Icons.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="h-[64px] bg-white border-b border-line px-4 sm:px-6 flex items-center justify-between">
      <Link
        to={user ? dashboardPathForRole(user.role) : '/'}
        className="flex items-center gap-2.5 font-extrabold text-lg text-ink-950 tracking-tight"
      >
        <span className="w-7 h-7 rounded-[7px] bg-ink-950 text-white flex items-center justify-center font-black text-sm">
          R
        </span>
        <span>ResQNet</span>
      </Link>

      <div className="flex items-center gap-4">
        <ConnectionStatus />

        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-line text-xs">
            <span className="hidden sm:inline font-semibold text-slate-700">{user.name}</span>
            <span className="px-2 py-0.5 rounded-badge text-[10px] font-mono uppercase bg-slate-100 text-slate-700 border border-slate-200">
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-control text-slate-400 hover:text-coral-700 transition-colors"
              title="Log out"
              aria-label="Log out"
            >
              <IconLogOut width={16} height={16} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
