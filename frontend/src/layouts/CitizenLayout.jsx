import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ConnectionStatus from '../components/ui/ConnectionStatus.jsx';
import AlertBanner from '../components/alerts/AlertBanner.jsx';
import AssistantChat from '../components/assistant/AssistantChat.jsx';
import {
  IconHome,
  IconAlertOctagon,
  IconBuilding,
  IconFileText,
  IconLogOut,
  IconMenu,
  IconX,
  IconShieldCheck,
  IconHelpCircle,
} from '../components/ui/Icons.jsx';
import Button from '../components/ui/Button.jsx';

export function CitizenLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/citizen', icon: <IconHome width={16} height={16} /> },
    { label: 'Facilities', path: '/citizen/facilities', icon: <IconBuilding width={16} height={16} /> },
    { label: 'Alerts', path: '/alerts', icon: <IconAlertOctagon width={16} height={16} /> },
    { label: 'Preparedness', path: '/help/preparedness', icon: <IconHelpCircle width={16} height={16} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-paper text-slate-900">
      {/* Top Header */}
      <header className="h-[66px] bg-white border-b border-line sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/citizen" className="flex items-center gap-2.5 font-extrabold text-lg text-ink-950 tracking-tight">
            <span className="w-7 h-7 rounded-[7px] bg-ink-950 text-white flex items-center justify-center font-black text-sm">
              R
            </span>
            <span>ResQNet</span>
            <span className="px-2 py-0.5 rounded-badge text-[10px] uppercase font-mono font-bold bg-blue-100 text-blue-800">
              Citizen
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 transition-colors py-1 ${
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

          {/* Prominent Emergency Action */}
          <Link to="/citizen/report">
            <Button size="sm" variant="critical" icon={<IconAlertOctagon width={14} height={14} />}>
              Report SOS
            </Button>
          </Link>

          {/* User profile / Logout dropdown */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-line text-xs">
            <Link
              to="/profile"
              className="font-medium text-slate-700 hover:text-blue-700 transition-colors"
              title="View Profile"
            >
              {user?.name}
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-control text-slate-400 hover:text-coral-700 transition-colors"
              aria-label="Log out"
              title="Log out"
            >
              <IconLogOut width={16} height={16} />
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-control text-slate-600 hover:text-ink-950"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <IconX width={20} height={20} /> : <IconMenu width={20} height={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Header Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-line px-4 py-3 space-y-2 animate-fade-in shadow-dropdown">
          <nav className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-control hover:bg-slate-50"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2 rounded-control hover:bg-slate-50"
            >
              <IconShieldCheck width={16} height={16} />
              <span>My Profile ({user?.name})</span>
            </Link>
          </nav>
          <div className="pt-2 border-t border-line">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-coral-700 hover:bg-coral-50 rounded-control"
            >
              <IconLogOut width={16} height={16} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 pb-20 sm:pb-8">
        <AlertBanner />
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-line z-30 flex items-center justify-around px-2"
        aria-label="Mobile Navigation"
      >
        <Link
          to="/citizen"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
            location.pathname === '/citizen' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}
        >
          <IconHome width={18} height={18} />
          <span>Home</span>
        </Link>

        <Link
          to="/citizen/report"
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-coral-700 -mt-3"
        >
          <span className="w-11 h-11 rounded-full bg-coral-700 text-white flex items-center justify-center shadow-md">
            <IconAlertOctagon width={22} height={22} />
          </span>
          <span>Report SOS</span>
        </Link>

        <Link
          to="/citizen/facilities"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
            location.pathname === '/citizen/facilities' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}
        >
          <IconBuilding width={18} height={18} />
          <span>Facilities</span>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
            location.pathname === '/profile' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}
        >
          <IconShieldCheck width={18} height={18} />
          <span>Profile</span>
        </Link>
      </nav>

      {/* Global Safety Guidance Assistant */}
      <AssistantChat />
    </div>
  );
}

export default CitizenLayout;
