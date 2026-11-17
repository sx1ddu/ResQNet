import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import CitizenLayout from '../layouts/CitizenLayout.jsx';
import Button from '../components/ui/Button.jsx';
import { FormField, Input, Textarea, Select } from '../components/ui/FormField.jsx';
import { SeverityIndicator } from '../components/ui/Indicators.jsx';
import {
  IconAlertOctagon,
  IconMapPin,
  IconSparkles,
  IconCheck,
  IconAlertCircle,
  IconRefreshCw,
  IconShieldCheck,
} from '../components/ui/Icons.jsx';

const CATEGORIES = [
  { value: 'flood', label: 'Flood / Water Inundation' },
  { value: 'fire', label: 'Fire Outbreak / Gas Hazard' },
  { value: 'earthquake', label: 'Earthquake / Tremor' },
  { value: 'medical', label: 'Medical Emergency / Trauma' },
  { value: 'structural', label: 'Structural Collapse / Road Block' },
  { value: 'other', label: 'Other Hazard' },
];

const DEMO_REFERENCE_LOCATION = {
  lng: 72.8777,
  lat: 19.076,
  label: 'Regional Demo Reference (Mumbai, Maharashtra)',
};

export default function ReportIncident() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    type: 'incident_report', // 'sos' | 'incident_report'
    title: '',
    description: '',
    category: 'flood',
    address: '',
  });

  const [locationStatus, setLocationStatus] = useState('detecting'); // 'detecting' | 'live' | 'denied'
  const [coords, setCoords] = useState(null); // { lng, lat }
  const [confirmDemoFallback, setConfirmDemoFallback] = useState(false);

  const [aiPreview, setAiPreview] = useState(null);
  const [aiPreviewLoading, setAiPreviewLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  // Browser Geolocation attempt on mount
  const detectLocation = () => {
    setLocationStatus('detecting');
    setSubmissionError('');
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lng: pos.coords.longitude, lat: pos.coords.latitude });
        setLocationStatus('live');
      },
      () => {
        setLocationStatus('denied');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  // AI Classification Preview (Advisory)
  const handleDescriptionBlur = async () => {
    if (form.title.trim().length < 3 || form.description.trim().length < 10) return;
    setAiPreviewLoading(true);
    try {
      const { data } = await api.post('/ai/classify', {
        title: form.title,
        description: form.description,
      });
      setAiPreview(data);
    } catch {
      // AI preview failure should never block reporting
      setAiPreview(null);
    } finally {
      setAiPreviewLoading(false);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      let finalLng;
      let finalLat;
      let reporterLng = undefined;
      let reporterLat = undefined;

      if (locationStatus === 'live' && coords) {
        finalLng = coords.lng;
        finalLat = coords.lat;
        reporterLng = coords.lng;
        reporterLat = coords.lat;
      } else if (confirmDemoFallback) {
        // Explicitly acknowledged demo fallback
        const jitter = () => (Math.random() - 0.5) * 0.01;
        finalLng = DEMO_REFERENCE_LOCATION.lng + jitter();
        finalLat = DEMO_REFERENCE_LOCATION.lat + jitter();
      } else {
        throw new Error(
          'Valid incident coordinates required. Please enable device location access or explicitly confirm the demo reference coordinates.'
        );
      }

      const payload = {
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        address: form.address.trim() || undefined,
        lng: finalLng,
        lat: finalLat,
        ...(reporterLng !== undefined ? { reporterLng, reporterLat } : {}),
      };

      const { data } = await api.post('/incidents', payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      navigate('/citizen');
    },
    onError: (err) => {
      setSubmissionError(
        err.response?.data?.message || err.message || 'Failed to submit incident report.'
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmissionError('');

    if (locationStatus !== 'live' && !confirmDemoFallback) {
      setSubmissionError(
        'Location access was not granted. To submit without live GPS, you must explicitly confirm placing this report at the demo reference location below.'
      );
      return;
    }

    submitMutation.mutate();
  };

  return (
    <CitizenLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <div className="text-[11px] font-mono font-bold uppercase text-blue-700 tracking-wider mb-1">
            Citizen Incident Reporting
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-950 tracking-tight">
            Tell us what is happening.
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Share essential hazard details. For immediate, life-threatening danger, contact official helpline 112 directly.
          </p>
        </div>

        {submissionError && (
          <div className="p-4 rounded-panel bg-coral-50 border border-coral-200 text-coral-900 text-xs flex items-start gap-2.5 animate-fade-in" role="alert">
            <IconAlertCircle width={18} height={18} className="text-coral-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Submission Blocked</p>
              <p className="mt-0.5">{submissionError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 rounded-panel border border-line bg-white shadow-panel space-y-5">
          {/* Report Type Selector: SOS vs Standard */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
              Report Priority Level *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'sos' })}
                className={`p-3.5 rounded-control border text-left flex items-center gap-3 transition-all ${
                  form.type === 'sos'
                    ? 'bg-coral-50 border-coral-700 text-coral-900 ring-2 ring-coral-700/20'
                    : 'border-line hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <span className="w-9 h-9 rounded-full bg-coral-700 text-white flex items-center justify-center shrink-0">
                  <IconAlertOctagon width={18} height={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-coral-950">SOS · Immediate Danger</p>
                  <p className="text-[11px] text-coral-800">Critical threat to human life</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'incident_report' })}
                className={`p-3.5 rounded-control border text-left flex items-center gap-3 transition-all ${
                  form.type === 'incident_report'
                    ? 'bg-blue-50 border-blue-700 text-blue-900 ring-2 ring-blue-700/20'
                    : 'border-line hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <span className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center shrink-0">
                  <IconShieldCheck width={18} height={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-blue-950">Standard Incident Report</p>
                  <p className="text-[11px] text-blue-800">Hazard, blockage, or assistance</p>
                </div>
              </button>
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Short Incident Title" id="title" required>
              <Input
                id="title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Water rising rapidly near underpass"
              />
            </FormField>

            <FormField label="Hazard Category" id="category" required>
              <Select
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          {/* Description */}
          <FormField
            label="Incident Description"
            id="desc"
            required
            helperText="Describe what is occurring, who is affected, and visible hazards. (Avoid private medical identifiers)."
          >
            <Textarea
              id="desc"
              rows={4}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              onBlur={handleDescriptionBlur}
              placeholder="What is happening? Who may be trapped or injured? What access routes are blocked?"
            />
          </FormField>

          {/* Landmark / Address */}
          <FormField label="Nearest Street, Landmark, or Building (Optional)" id="address">
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="e.g. Near Dadar Railway Station / Landmark"
            />
          </FormField>

          {/* Safe Location Handling Panel */}
          <div className="p-4 rounded-control border border-line bg-paper space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <IconMapPin width={14} height={14} className="text-blue-700" />
                <span>Location Provenance Status</span>
              </span>
              <button
                type="button"
                onClick={detectLocation}
                className="text-xs font-mono text-blue-700 hover:underline flex items-center gap-1"
              >
                <IconRefreshCw width={12} height={12} /> Retry GPS
              </button>
            </div>

            {locationStatus === 'detecting' && (
              <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Detecting device geolocation from browser…</span>
              </p>
            )}

            {locationStatus === 'live' && coords && (
              <div className="p-2.5 rounded bg-teal-50 border border-teal-200 text-teal-900 text-xs space-y-0.5">
                <p className="font-semibold flex items-center gap-1 text-teal-800">
                  <IconCheck width={14} height={14} /> Live Device Geolocation Captured
                </p>
                <p className="font-mono text-[11px] text-teal-700">
                  Coordinates: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} (will be submitted as ground truth)
                </p>
              </div>
            )}

            {locationStatus === 'denied' && (
              <div className="space-y-3">
                <div className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <p className="font-bold flex items-center gap-1.5">
                    <IconAlertCircle width={15} height={15} className="text-amber-700" />
                    Device Geolocation Unavailable
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    Browser location permission was denied or timed out. ResQNet will never silently pretend you are at demo coordinates.
                  </p>
                </div>

                <div className="p-3 rounded border border-line bg-white space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmDemoFallback}
                      onChange={(e) => setConfirmDemoFallback(e.target.checked)}
                      className="mt-0.5 rounded border-line text-blue-700 focus:ring-blue-700"
                    />
                    <div className="text-xs text-slate-700">
                      <span className="font-semibold block">
                        Confirm submission at Demo Reference Location
                      </span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        I acknowledge this report is for testing or scenario evaluation and will be mapped at {DEMO_REFERENCE_LOCATION.label}.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* AI Classification Advisory Preview Panel */}
          {(aiPreviewLoading || aiPreview) && (
            <div className="p-4 rounded-control border border-blue-200 bg-blue-50/60 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase text-blue-800 flex items-center gap-1">
                  <IconSparkles width={13} height={13} />
                  <span>AI Classification Advisory Preview</span>
                </span>
                <span className="text-[10px] font-mono text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                  Source: {aiPreview?.source || 'advisory'}
                </span>
              </div>

              {aiPreviewLoading ? (
                <p className="text-slate-600 italic">Analyzing incident description with triage model…</p>
              ) : (
                <div className="space-y-1.5 text-slate-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>Suggested Risk:</span>
                    <SeverityIndicator severity={aiPreview.suggestedSeverity} />
                    <span className="text-slate-500">·</span>
                    <span>Category: <strong>{aiPreview.suggestedCategory}</strong></span>
                  </div>
                  {aiPreview.summary && (
                    <p className="text-slate-700 text-xs leading-relaxed italic bg-white p-2 rounded border border-blue-100">
                      "{aiPreview.summary}"
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500 font-mono pt-1">
                    Advisory suggestion only. Official EOC evaluation and authority review remain ground truth.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Link to="/citizen" className="text-xs text-slate-500 hover:text-ink-950 font-medium">
              ← Cancel and Return
            </Link>

            <Button
              type="submit"
              size="lg"
              variant={form.type === 'sos' ? 'critical' : 'primary'}
              disabled={submitMutation.isPending}
              loading={submitMutation.isPending}
              className="px-6"
            >
              {form.type === 'sos' ? 'Submit SOS Alert →' : 'Submit Incident Report →'}
            </Button>
          </div>
        </form>
      </div>
    </CitizenLayout>
  );
}
