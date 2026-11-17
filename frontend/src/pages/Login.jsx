import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { dashboardPathForRole } from '../utils/roleRouting.js';
import Button from '../components/ui/Button.jsx';
import { FormField, Input } from '../components/ui/FormField.jsx';
import { IconEye, IconEyeOff, IconLock, IconShieldCheck, IconAlertCircle } from '../components/ui/Icons.jsx';

const DEMO_ACCOUNTS = [
  { label: 'Citizen', email: 'citizen@demo.resqnet.app', role: 'Citizen' },
  { label: 'EOC Control', email: 'eoc@demo.resqnet.app', role: 'EOC Operations' },
  { label: 'Rescue Team', email: 'rescue@demo.resqnet.app', role: 'Responder' },
  { label: 'Hospital', email: 'hospital@demo.resqnet.app', role: 'Facility (Beds)' },
  { label: 'Shelter', email: 'shelter@demo.resqnet.app', role: 'Facility (Occupants)' },
  { label: 'Volunteer', email: 'volunteer@demo.resqnet.app', role: 'Community' },
];

const DEMO_PASSWORD = 'Demo@1234';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      const redirectTo = location.state?.from?.pathname || dashboardPathForRole(user.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please verify your email and password.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (email) => {
    setForm({ email, password: DEMO_PASSWORD });
    setError('');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-paper text-slate-900">
      {/* Left Column: Brand Hero Aside (Desktop) */}
      <aside className="hidden lg:flex lg:col-span-5 bg-ink-950 text-white p-12 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-xl text-white tracking-tight">
            <span className="w-8 h-8 rounded-[7px] bg-blue-700 text-white flex items-center justify-center font-black text-sm">
              R
            </span>
            <span>ResQNet</span>
          </Link>

          <div className="mt-24 space-y-6 max-w-md">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
              Civic Response Command
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
              A clearer operational picture starts with the right people.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sign in to access your role-based workspace for incident reporting, emergency field dispatch, or facility capacity management.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-ink-800 text-xs text-slate-500 font-mono flex items-center gap-2">
          <IconShieldCheck width={16} height={16} className="text-teal-400" />
          <span>Access token maintained in memory. HttpOnly refresh session.</span>
        </div>
      </aside>

      {/* Right Column: Sign In Form */}
      <main className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Top Brand Link for Mobile */}
          <div className="lg:hidden flex items-center justify-between pb-4 border-b border-line">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-lg text-ink-950">
              <span className="w-7 h-7 rounded-[7px] bg-ink-950 text-white flex items-center justify-center font-bold text-xs">
                R
              </span>
              <span>ResQNet</span>
            </Link>
            <Link to="/" className="text-xs font-medium text-slate-500 hover:text-ink-950">
              ← Return home
            </Link>
          </div>

          <div>
            <div className="text-xs font-mono font-bold uppercase text-blue-700 tracking-wider mb-1">
              Authentication
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-950 tracking-tight">
              Sign in to ResQNet
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
              Enter your registered credentials to access your designated workspace.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-control bg-coral-50 border border-coral-200 text-coral-800 text-xs flex items-start gap-2 animate-fade-in" role="alert">
              <IconAlertCircle width={16} height={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email Address" id="email" required>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@organization.org"
                autoComplete="email"
              />
            </FormField>

            <FormField label="Password" id="password" required>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <IconEyeOff width={16} height={16} /> : <IconEye width={16} height={16} />}
                </button>
              </div>
            </FormField>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={submitting}
              loading={submitting}
              className="w-full font-semibold"
            >
              Sign In to ResQNet →
            </Button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="rounded-panel border border-line bg-white p-4.5 space-y-3 shadow-panel">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                Quick Demo Access Accounts
              </span>
              <span className="text-[10px] font-mono text-slate-400">PASSWORD: Demo@1234</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Click any seeded account below to populate credentials and test role-specific workflows:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email)}
                  className={`p-2 rounded-control border text-left transition-colors ${
                    form.email === acc.email
                      ? 'bg-blue-100 border-blue-700 text-blue-900 font-bold'
                      : 'border-line hover:border-slate-400 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="text-xs font-semibold truncate">{acc.label}</p>
                  <p className="text-[10px] text-slate-400 truncate font-mono">{acc.role}</p>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-slate-600">
            Need to register a new account?{' '}
            <Link to="/register" className="font-semibold text-blue-700 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
