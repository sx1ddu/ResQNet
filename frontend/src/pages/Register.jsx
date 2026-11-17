import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { dashboardPathForRole } from '../utils/roleRouting.js';
import Button from '../components/ui/Button.jsx';
import { FormField, Input, Select } from '../components/ui/FormField.jsx';
import {
  IconEye,
  IconEyeOff,
  IconShieldCheck,
  IconFileText,
  IconCheck,
  IconAlertCircle,
} from '../components/ui/Icons.jsx';

const ROLE_OPTIONS = [
  { value: 'citizen', label: 'Citizen (Public individual)' },
  { value: 'rescue_team', label: 'Rescue Team (Field responder unit)' },
  { value: 'hospital', label: 'Hospital (Healthcare facility)' },
  { value: 'shelter', label: 'Shelter (Community relief center)' },
  { value: 'volunteer', label: 'Volunteer (Community responder)' },
  { value: 'ngo', label: 'NGO (Non-governmental relief agency)' },
];

const NON_CITIZEN_ROLES = ['hospital', 'shelter', 'rescue_team', 'ngo', 'volunteer'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen',
    organizationName: '',
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [docFile, setDocFile] = useState(null); // { dataUrl, fileName, fileSize }
  const [docError, setDocError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOrgRole = form.role !== 'citizen' && form.role !== 'volunteer';
  const needsDocument = NON_CITIZEN_ROLES.includes(form.role);

  const handleFileChange = (e) => {
    setDocError('');
    const file = e.target.files?.[0];
    if (!file) {
      setDocFile(null);
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setDocFile(null);
      setDocError('Document must be a valid image file (PNG, JPEG, or WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setDocFile(null);
      setDocError('Document file size must not exceed 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDocFile({
        dataUrl: reader.result,
        fileName: file.name,
        sizeKb: Math.round(file.size / 1024),
      });
    };
    reader.onerror = () => {
      setDocError('Failed to read file. Please select another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (needsDocument && !docFile) {
      setError('An organization verification document or certificate is required for this role.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        ...(form.phone ? { phone: form.phone } : {}),
        ...(isOrgRole && form.organizationName ? { organizationName: form.organizationName } : {}),
        ...(needsDocument && docFile ? { verificationDocument: { dataUrl: docFile.dataUrl, fileName: docFile.fileName } } : {}),
      };

      const user = await register(payload);
      navigate(dashboardPathForRole(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check the provided information.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-paper text-slate-900">
      {/* Left Column: Information Panel */}
      <aside className="hidden lg:flex lg:col-span-5 bg-ink-950 text-white p-12 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-xl text-white tracking-tight">
            <span className="w-8 h-8 rounded-[7px] bg-blue-700 text-white flex items-center justify-center font-black text-sm">
              R
            </span>
            <span>ResQNet</span>
          </Link>

          <div className="mt-20 space-y-6 max-w-md">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
              Join The Response Network
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Coordinated crisis response requires verified trust.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Citizens can register immediately to file reports and locate resources. Responder and facility roles upload credentials for authority verification to preserve network integrity.
            </p>

            <div className="space-y-3 pt-4 border-t border-ink-800 text-xs">
              <div className="flex items-start gap-2.5 text-slate-300">
                <IconCheck width={16} height={16} className="text-teal-400 shrink-0 mt-0.5" />
                <span>Single authenticated session with silent token refresh</span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-300">
                <IconCheck width={16} height={16} className="text-teal-400 shrink-0 mt-0.5" />
                <span>EOC officers review organization proof before gated operations</span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-300">
                <IconCheck width={16} height={16} className="text-teal-400 shrink-0 mt-0.5" />
                <span>Live capacity publishing for hospitals and relief shelters</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-ink-800 text-xs text-slate-500 font-mono">
          EOC administration accounts are created through authorized municipal provisioning only.
        </div>
      </aside>

      {/* Right Column: Registration Form */}
      <main className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Back Link */}
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
              Account Registration
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-950 tracking-tight">
              Create your account
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
              Join ResQNet to access incident reporting and regional coordination.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-control bg-coral-50 border border-coral-200 text-coral-800 text-xs flex items-start gap-2 animate-fade-in" role="alert">
              <IconAlertCircle width={16} height={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Full Name or Representative" id="name" required>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Dr. Aarav Sharma / Officer Name"
              />
            </FormField>

            <FormField label="Email Address" id="email" required>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="representative@organization.org"
                autoComplete="email"
              />
            </FormField>

            <FormField label="Password (Min. 6 Characters)" id="password" required>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
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

            <FormField label="Select Role in Response Network" id="role" required>
              <Select
                id="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </FormField>

            {isOrgRole && (
              <FormField label="Organization / Agency Name" id="orgName" required>
                <Input
                  id="orgName"
                  required
                  value={form.organizationName}
                  onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                  placeholder="e.g. Lokmanya Municipal Hospital / NDRF Team 4"
                />
              </FormField>
            )}

            <FormField label="Contact Phone (Optional)" id="phone">
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 22 2407 6381"
              />
            </FormField>

            {/* Document Upload for Non-Citizens */}
            {needsDocument && (
              <div className="p-4 rounded-panel border border-dashed border-line bg-white space-y-2.5">
                <div className="flex items-center gap-2">
                  <IconFileText width={16} height={16} className="text-blue-700" />
                  <span className="text-xs font-bold font-mono uppercase text-slate-800">
                    Verification Document / ID Proof
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Upload an image of your organization registration certificate or official duty identification (PNG, JPEG, WebP, max 2MB).
                </p>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-control file:border file:border-line file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
                />

                {docFile && (
                  <p className="text-xs font-medium text-teal-700 flex items-center gap-1.5 pt-1">
                    <IconCheck width={14} height={14} />
                    <span>{docFile.fileName} ({docFile.sizeKb} KB) verified and ready to upload</span>
                  </p>
                )}

                {docError && (
                  <p className="text-xs font-medium text-coral-700 flex items-center gap-1 pt-1">
                    <IconAlertCircle width={14} height={14} />
                    <span>{docError}</span>
                  </p>
                )}

                <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-900 leading-normal">
                  <strong>Notice:</strong> Your account will be created immediately, but organization-restricted operations (such as self-assignment or capacity management) will remain gated until an EOC administrator reviews your uploaded document.
                </div>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={submitting}
              loading={submitting}
              className="w-full font-semibold"
            >
              Create Account →
            </Button>
          </form>

          <p className="text-center text-xs text-slate-600">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-blue-700 hover:underline">
              Sign in to your account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
