import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { dashboardPathForRole } from '../utils/roleRouting.js';
import PublicLayout from '../layouts/PublicLayout.jsx';
import Button from '../components/ui/Button.jsx';
import { IconAlertOctagon } from '../components/ui/Icons.jsx';

export default function NotFound() {
  const { user } = useAuth();

  return (
    <PublicLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-16 h-16 rounded-full bg-coral-100 text-coral-700 flex items-center justify-center mb-4">
          <IconAlertOctagon width={32} height={32} />
        </div>

        <div className="text-xs font-mono font-bold uppercase text-coral-700 tracking-wider mb-2">
          404 Error · Page Not Found
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-950 tracking-tight mb-2">
          This route does not exist.
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
          The link you followed may be expired, mistyped, or restricted to an authorized operations account.
        </p>

        <div className="flex items-center gap-3">
          <Link to="/">
            <Button size="md" variant="secondary">
              ← Return to Home
            </Button>
          </Link>

          {user ? (
            <Link to={dashboardPathForRole(user.role)}>
              <Button size="md" variant="primary">
                Open Your Dashboard ({user.role}) →
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="md" variant="primary">
                Sign In →
              </Button>
            </Link>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
