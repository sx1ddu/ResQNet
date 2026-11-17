import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { dashboardPathForRole } from '../utils/roleRouting.js';
import { IconMenu, IconX, IconShieldCheck } from '../components/ui/Icons.jsx';
import Button from '../components/ui/Button.jsx';

export function PublicLayout({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-paper text-slate-900">
      {/* Top Header */}
      <header className="h-[66px] bg-white border-b border-line sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-lg text-ink-950 tracking-tight">
            <span className="w-7 h-7 rounded-[7px] bg-ink-950 text-white flex items-center justify-center font-black text-sm">
              R
            </span>
            <span>ResQNet</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link to="/alerts" className="hover:text-ink-950 transition-colors">
              Active Alerts
            </Link>
            <Link to="/help/preparedness" className="hover:text-ink-950 transition-colors">
              Preparedness Guide
            </Link>
            <Link to="/help/accessibility" className="hover:text-ink-950 transition-colors">
              Accessibility
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate(dashboardPathForRole(user.role))}
            >
              Open Workspace ({user.role}) →
            </Button>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center justify-center min-h-[36px] px-3.5 py-1.5 text-xs font-semibold text-ink-950 border border-line rounded-control hover:bg-slate-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center min-h-[36px] px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-control transition-colors shadow-xs"
              >
                Create Account
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-control text-slate-600 hover:text-ink-950 hover:bg-slate-100"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <IconX width={20} height={20} /> : <IconMenu width={20} height={20} />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-line px-6 py-4 space-y-3 animate-fade-in shadow-dropdown">
          <nav className="flex flex-col gap-2.5 text-sm font-medium text-slate-700">
            <Link
              to="/alerts"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-blue-700"
            >
              Active Alerts
            </Link>
            <Link
              to="/help/preparedness"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-blue-700"
            >
              Preparedness Guide
            </Link>
            <Link
              to="/help/accessibility"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-blue-700"
            >
              Accessibility & Help
            </Link>
          </nav>
          <div className="pt-3 border-t border-line flex flex-col gap-2">
            {user ? (
              <Button
                size="md"
                variant="primary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(dashboardPathForRole(user.role));
                }}
              >
                Open Workspace ({user.role}) →
              </Button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-ink-950 border border-line rounded-control hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-control"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-line bg-white py-10 px-4 sm:px-8 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-[5px] bg-ink-950 text-white flex items-center justify-center font-bold text-xs">
              R
            </span>
            <span className="font-bold text-ink-950 text-sm">ResQNet</span>
            <span className="text-slate-400">·</span>
            <span>Civic Response Command</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600">
            <Link to="/help/preparedness" className="hover:text-ink-950">
              Preparedness
            </Link>
            <Link to="/help/accessibility" className="hover:text-ink-950">
              Accessibility
            </Link>
            <Link to="/alerts" className="hover:text-ink-950">
              Active Alerts
            </Link>
            <Link to="/login" className="hover:text-ink-950">
              Operations Sign In
            </Link>
          </div>

          <div className="text-slate-400 text-center sm:text-right">
            Designed for coordination. Not a replacement for official local emergency services.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
