import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ConnectionStatus from '../components/ui/ConnectionStatus.jsx';
import AlertBanner from '../components/alerts/AlertBanner.jsx';
import AssistantChat from '../components/assistant/AssistantChat.jsx';
import {
  IconActivity,
  IconBuilding,
  IconAlertTriangle,
  IconShieldCheck,
  IconLogOut,
} from '../components/ui/Icons.jsx';

export function RescueLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Field Console', path: '/rescue', icon: <IconActivity width={18} height={18} /> },
    { label: 'Shelters & Hospitals', path: '/citizen/facilities', icon: <IconBuilding width={18} height={18} /> },
    { label: 'Active Alerts', path: '/alerts', icon: <IconAlertTriangle width={18} height={18} /> },
    { label: 'Team Profile', path: '/profile', icon: <IconShieldCheck width={18} height={18} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-slate-100 dark">
      {/* Top Header */}
      <header className="h-[64px] bg-surfaceDark border-b border-surfaceDark-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link to="/rescue" className="flex items-center gap-2.5 font-extrabold text-lg text-white tracking-tight">
            <span className="w-7 h-7 rounded-[7px] bg-blue-700 text-white flex items-center justify-center font-black text-sm">
              R
            </span>
            <span>ResQNet</span>
            <span className="px-2 py-0.5 rounded-badge text-[10px] uppercase font-mono font-bold bg-teal-900/60 text-teal-300 border border-teal-700/60">
              RESCUE
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-300 ml-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 py-1 transition-colors ${
                    isActive ? 'text-blue-400 font-bold border-b-2 border-blue-400' : 'hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ConnectionStatus dark={true} />

          <div className="flex items-center gap-3 pl-3 border-l border-surfaceDark-border text-xs">
            <div className="hidden sm:block text-right">
              <p className="font-semibold text-slate-200">{user?.name}</p>
              <p className="text-[10px] font-mono text-teal-400">VERIFIED RESPONDER</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-control text-slate-400 hover:text-coral-400 hover:bg-surfaceDark-panel transition-colors"
              title="Log out"
              aria-label="Log out"
            >
              <IconLogOut width={18} height={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20 sm:pb-6">
        <AlertBanner dark={true} />
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar for Field Operatives */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-surfaceDark border-t border-surfaceDark-border z-30 flex items-center justify-around px-2 text-slate-300"
        aria-label="Rescue field navigation"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium min-h-[44px] justify-center ${
                isActive ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              {item.icon}
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Assistant with field search support */}
      <AssistantChat dark={true} />
    </div>
  );
}

export default RescueLayout;
