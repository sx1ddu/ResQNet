import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ConnectionStatus from '../components/ui/ConnectionStatus.jsx';
import AlertBanner from '../components/alerts/AlertBanner.jsx';
import AssistantChat from '../components/assistant/AssistantChat.jsx';
import {
  IconActivity,
  IconRadio,
  IconShieldCheck,
  IconUsers,
  IconBuilding,
  IconLogOut,
  IconMenu,
  IconX,
  IconAlertTriangle,
  IconLayers,
} from '../components/ui/Icons.jsx';

export function EOCLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Command Center', path: '/eoc', icon: <IconActivity width={16} height={16} /> },
    { label: 'Directory', path: '/eoc/directory', icon: <IconBuilding width={16} height={16} /> },
    { label: 'Verification Queue', path: '/eoc/verification', icon: <IconShieldCheck width={16} height={16} /> },
    { label: 'Broadcasts', path: '/eoc/broadcasts', icon: <IconRadio width={16} height={16} /> },
    { label: 'Active Alerts', path: '/alerts', icon: <IconAlertTriangle width={16} height={16} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-slate-100 dark">
      {/* Top Operations Header */}
      <header className="h-[64px] bg-surfaceDark border-b border-surfaceDark-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 rounded-control text-slate-300 hover:text-white hover:bg-surfaceDark-panel"
            aria-label="Toggle workspace navigation"
          >
            {sidebarOpen ? <IconX width={20} height={20} /> : <IconMenu width={20} height={20} />}
          </button>

          <Link to="/eoc" className="flex items-center gap-2.5 font-extrabold text-lg text-white tracking-tight">
            <span className="w-7 h-7 rounded-[7px] bg-blue-700 text-white flex items-center justify-center font-black text-sm">
              R
            </span>
            <span>ResQNet</span>
            <span className="px-2 py-0.5 rounded-badge text-[10px] uppercase font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-700/60">
              OPERATIONS
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ConnectionStatus dark={true} />

          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-surfaceDark-border text-xs">
            <div className="text-right">
              <p className="font-semibold text-slate-200">{user?.name}</p>
              <p className="text-[10px] font-mono text-slate-400 uppercase">
                {user?.role === 'admin' ? 'SYSTEM ADMIN' : 'EOC DUTY OFFICER'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-control text-slate-400 hover:text-coral-400 hover:bg-surfaceDark-panel transition-colors"
              title="Log out"
              aria-label="Log out"
            >
              <IconLogOut width={16} height={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Rail */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-30 w-60 bg-surfaceDark border-r border-surfaceDark-border transform md:transform-none transition-transform duration-200 ease-in-out flex flex-col pt-16 md:pt-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="p-4 flex-1 space-y-6">
            <div>
              <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
                Regional Operations
              </p>
              <nav className="space-y-1">
                {navLinks.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-control text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-700 text-white font-semibold'
                          : 'text-slate-300 hover:bg-surfaceDark-raised hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-surfaceDark-border">
              <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
                Account & Governance
              </p>
              <nav className="space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-control text-xs font-medium transition-colors ${
                    location.pathname === '/profile'
                      ? 'bg-surfaceDark-raised text-white font-semibold'
                      : 'text-slate-400 hover:bg-surfaceDark-raised hover:text-white'
                  }`}
                >
                  <IconShieldCheck width={16} height={16} />
                  <span>Officer Profile</span>
                </Link>
                <Link
                  to="/help/preparedness"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-control text-xs font-medium text-slate-400 hover:bg-surfaceDark-raised hover:text-white transition-colors"
                >
                  <IconLayers width={16} height={16} />
                  <span>Protocols & Help</span>
                </Link>
              </nav>
            </div>
          </div>

          <div className="p-4 border-t border-surfaceDark-border text-[11px] font-mono text-slate-400">
            <p>ResQNet v2.0</p>
            <p className="text-[10px] text-slate-400">Civic Response Command</p>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-ink-950/80 z-20 md:hidden"
          />
        )}

        {/* Main Operational Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 min-w-0">
          <AlertBanner dark={true} />
          {children}
        </main>
      </div>

      {/* Global EOC Dispatch Assistant */}
      <AssistantChat dark={true} />
    </div>
  );
}

export default EOCLayout;
