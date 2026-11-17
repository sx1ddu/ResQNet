import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ConnectionStatus from '../components/ui/ConnectionStatus.jsx';
import AlertBanner from '../components/alerts/AlertBanner.jsx';
import AssistantChat from '../components/assistant/AssistantChat.jsx';
import {
  IconBuilding,
  IconBed,
  IconHome,
  IconAlertTriangle,
  IconShieldCheck,
  IconLogOut,
} from '../components/ui/Icons.jsx';

export function FacilityLayout({ facilityType = 'hospital', children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isHospital = facilityType === 'hospital';
  const rootPath = isHospital ? '/hospital' : '/shelter';

  const navItems = [
    {
      label: isHospital ? 'Hospital Workspace' : 'Shelter Workspace',
      path: rootPath,
      icon: isHospital ? <IconBed width={18} height={18} /> : <IconHome width={18} height={18} />,
    },
    { label: 'Regional Facilities', path: '/citizen/facilities', icon: <IconBuilding width={18} height={18} /> },
    { label: 'Active Alerts', path: '/alerts', icon: <IconAlertTriangle width={18} height={18} /> },
    { label: 'Facility Account', path: '/profile', icon: <IconShieldCheck width={18} height={18} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-paper text-slate-900">
      {/* Top Header */}
      <header className="h-[66px] bg-white border-b border-line px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link to={rootPath} className="flex items-center gap-2.5 font-extrabold text-lg text-ink-950 tracking-tight">
            <span className="w-7 h-7 rounded-[7px] bg-ink-950 text-white flex items-center justify-center font-black text-sm">
              R
            </span>
            <span>ResQNet</span>
            <span
              className={`px-2 py-0.5 rounded-badge text-[10px] uppercase font-mono font-bold ${
                isHospital
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {isHospital ? 'HOSPITAL' : 'SHELTER'}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 py-1 transition-colors ${
                    isActive ? 'text-blue-700 font-bold border-b-2 border-blue-700' : 'hover:text-ink-950'
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
          <ConnectionStatus />

          <div className="flex items-center gap-3 pl-3 border-l border-line text-xs">
            <div className="hidden sm:block text-right">
              <p className="font-semibold text-slate-800">{user?.organizationName || user?.name}</p>
              <p className="text-[10px] font-mono text-slate-500 uppercase">
                {isHospital ? 'HEALTHCARE FACILITY' : 'COMMUNITY RELIEF'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-control text-slate-400 hover:text-coral-700 hover:bg-slate-100 transition-colors"
              title="Log out"
              aria-label="Log out"
            >
              <IconLogOut width={18} height={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 pb-20 sm:pb-8">
        <AlertBanner />
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-line z-30 flex items-center justify-around px-2 text-slate-600"
        aria-label="Facility mobile navigation"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium min-h-[44px] justify-center ${
                isActive ? 'text-blue-700 font-bold' : 'text-slate-500'
              }`}
            >
              {item.icon}
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>

      <AssistantChat />
    </div>
  );
}

export default FacilityLayout;
