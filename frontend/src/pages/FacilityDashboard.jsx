import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import { useSocket } from '../context/SocketContext.jsx';
import FacilityLayout from '../layouts/FacilityLayout.jsx';
import IncidentMap from '../components/IncidentMap.jsx';
import { CapacityMeter } from '../components/ui/Indicators.jsx';
import Button from '../components/ui/Button.jsx';
import { FormField, Input, Select } from '../components/ui/FormField.jsx';
import {
  IconBuilding,
  IconBed,
  IconHome,
  IconCheck,
  IconAlertCircle,
  IconMapPin,
  IconPhone,
  IconActivity,
} from '../components/ui/Icons.jsx';

const VOCABULARY = {
  hospital: {
    noun: 'Hospital',
    capacityNoun: 'Beds',
    unitSingular: 'Bed',
    resourceHint: 'e.g. ICU, Emergency Trauma, Oxygen Supply, Blood Bank',
    statusOptions: [
      { value: 'operational', label: 'Operational (Accepting Patients)' },
      { value: 'full', label: 'Full Capacity (Diversion In Place)' },
      { value: 'closed', label: 'Closed / Evacuating' },
    ],
  },
  shelter: {
    noun: 'Relief Shelter',
    capacityNoun: 'Occupants',
    unitSingular: 'Occupant',
    resourceHint: 'e.g. Bedding, Drinking Water, Medical Tent, Food Rationing',
    statusOptions: [
      { value: 'operational', label: 'Operational (Sheltering Available)' },
      { value: 'full', label: 'Full Capacity (No Intake)' },
      { value: 'closed', label: 'Closed / Relocated' },
    ],
  },
};

const DEMO_REFERENCE_LOCATION = {
  lng: 72.8777,
  lat: 19.076,
  label: 'Regional Demo Reference (Mumbai, Maharashtra)',
};

export default function FacilityDashboard({ facilityType = 'hospital' }) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const vocab = VOCABULARY[facilityType] || VOCABULARY.hospital;
  const isHospital = facilityType === 'hospital';

  const { data: mineData, isLoading: loadingMine } = useQuery({
    queryKey: ['facilities', 'mine'],
    queryFn: async () => (await api.get('/facilities/mine')).data,
  });

  const { data: allFacilitiesData } = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => (await api.get('/facilities')).data,
  });

  const { data: incidentsData } = useQuery({
    queryKey: ['incidents', 'all'],
    queryFn: async () => (await api.get('/incidents')).data,
  });

  const facility = mineData?.facility || null;

  const [capacityUsed, setCapacityUsed] = useState(0);
  const [status, setStatus] = useState('operational');
  const [updateFeedback, setUpdateFeedback] = useState('');

  // Initial Registration form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    address: '',
    capacityTotal: 80,
    contactPhone: '',
    resources: '',
  });

  const [locationStatus, setLocationStatus] = useState('detecting');
  const [coords, setCoords] = useState(null);
  const [confirmDemoFallback, setConfirmDemoFallback] = useState(false);
  const [registrationError, setRegistrationError] = useState('');

  useEffect(() => {
    if (facility) {
      setCapacityUsed(facility.capacityUsed);
      setStatus(facility.status);
    }
  }, [facility]);

  // Geolocation detection for initial facility registration
  useEffect(() => {
    if (facility) return;
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lng: pos.coords.longitude, lat: pos.coords.latitude });
        setLocationStatus('live');
      },
      () => setLocationStatus('denied'),
      { timeout: 7000 }
    );
  }, [facility]);

  // Socket updates
  useEffect(() => {
    if (!socket) return;
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      queryClient.invalidateQueries({ queryKey: ['facilities', 'mine'] });
    };
    socket.on('facility:update', invalidate);
    socket.on('facility:new', invalidate);
    return () => {
      socket.off('facility:update', invalidate);
      socket.off('facility:new', invalidate);
    };
  }, [socket, queryClient]);

  const updateMutation = useMutation({
    mutationFn: async () =>
      (await api.patch(`/facilities/${facility._id}/capacity`, {
        capacityUsed: Number(capacityUsed),
        status,
      })).data,
    onSuccess: () => {
      setUpdateFeedback('Capacity update broadcast successfully to all active dashboards ✓');
      setTimeout(() => setUpdateFeedback(''), 4000);
      queryClient.invalidateQueries({ queryKey: ['facilities', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
    onError: (err) => {
      setUpdateFeedback(err.response?.data?.message || 'Failed to update capacity.');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      let finalLng;
      let finalLat;

      if (locationStatus === 'live' && coords) {
        finalLng = coords.lng;
        finalLat = coords.lat;
      } else if (confirmDemoFallback) {
        const jitter = () => (Math.random() - 0.5) * 0.02;
        finalLng = DEMO_REFERENCE_LOCATION.lng + jitter();
        finalLat = DEMO_REFERENCE_LOCATION.lat + jitter();
      } else {
        throw new Error('Please enable device location or confirm the demo reference coordinates.');
      }

      const { data } = await api.post('/facilities', {
        type: facilityType,
        name: registerForm.name.trim(),
        address: registerForm.address.trim(),
        capacityTotal: Number(registerForm.capacityTotal),
        contactPhone: registerForm.contactPhone.trim(),
        resources: registerForm.resources
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean),
        lng: finalLng,
        lat: finalLat,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
    onError: (err) => {
      setRegistrationError(err.response?.data?.message || err.message || 'Facility registration failed.');
    },
  });

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegistrationError('');

    if (locationStatus !== 'live' && !confirmDemoFallback) {
      setRegistrationError(
        'Location access was not captured. Please check the demo location confirmation box to place this facility.'
      );
      return;
    }

    registerMutation.mutate();
  };

  if (loadingMine) {
    return (
      <FacilityLayout facilityType={facilityType}>
        <p className="text-center py-16 text-xs font-mono text-slate-500">
          Loading {vocab.noun} operational profile…
        </p>
      </FacilityLayout>
    );
  }

  const allFacilities = allFacilitiesData?.facilities || [];
  const allIncidents = incidentsData?.incidents || [];

  return (
    <FacilityLayout facilityType={facilityType}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase text-blue-700 tracking-wider mb-1">
              Facility Operations · {vocab.noun}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-950 tracking-tight">
              {facility ? facility.name : `Register Your ${vocab.noun}`}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Publish real-time {vocab.capacityNoun.toLowerCase()} capacity to keep regional dispatchers and citizens informed.
            </p>
          </div>

          {facility && (
            <span
              className={`px-3 py-1 rounded-badge text-xs font-mono font-bold uppercase ${
                facility.status === 'operational'
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Status: {facility.status}
            </span>
          )}
        </div>

        {!facility ? (
          /* Initial Facility Registration Form */
          <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-panel border border-line bg-white shadow-panel space-y-5">
            <div>
              <h2 className="text-lg font-bold text-ink-950">
                Setup {vocab.noun} Profile
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Each verified account operates one primary facility on the ResQNet regional map.
              </p>
            </div>

            {registrationError && (
              <div className="p-3.5 rounded-control bg-coral-50 border border-coral-200 text-coral-800 text-xs flex items-start gap-2">
                <IconAlertCircle width={16} height={16} className="shrink-0 mt-0.5" />
                <span>{registrationError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <FormField label={`${vocab.noun} Official Name`} id="name" required>
                <Input
                  id="name"
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder={`e.g. ${isHospital ? 'Central District General Hospital' : 'Community Relief Center'}`}
                />
              </FormField>

              <FormField label="Full Physical Address" id="address" required>
                <Input
                  id="address"
                  required
                  value={registerForm.address}
                  onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                  placeholder="Street address, block, and city"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label={`Total ${vocab.capacityNoun} Capacity`} id="cap" required>
                  <Input
                    id="cap"
                    type="number"
                    min="1"
                    required
                    value={registerForm.capacityTotal}
                    onChange={(e) => setRegisterForm({ ...registerForm, capacityTotal: e.target.value })}
                  />
                </FormField>

                <FormField label="Emergency Contact Phone" id="phone" required>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={registerForm.contactPhone}
                    onChange={(e) => setRegisterForm({ ...registerForm, contactPhone: e.target.value })}
                    placeholder="+91 22 2407 6381"
                  />
                </FormField>
              </div>

              <FormField
                label="Available Specialized Resources (Comma separated)"
                id="res"
                helperText={vocab.resourceHint}
              >
                <Input
                  id="res"
                  value={registerForm.resources}
                  onChange={(e) => setRegisterForm({ ...registerForm, resources: e.target.value })}
                  placeholder={vocab.resourceHint}
                />
              </FormField>

              {/* Location Handling */}
              <div className="p-3.5 rounded-control border border-line bg-paper space-y-2 text-xs">
                <p className="font-mono font-bold uppercase text-slate-700">Geographic Location</p>
                {locationStatus === 'live' && coords ? (
                  <p className="text-teal-700 font-semibold flex items-center gap-1">
                    <IconCheck width={14} height={14} /> Device Location captured: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-slate-600">
                      Live GPS was not captured. Check the box below to map this facility at the demo reference location.
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={confirmDemoFallback}
                        onChange={(e) => setConfirmDemoFallback(e.target.checked)}
                        className="rounded border-line text-blue-700"
                      />
                      <span>Confirm placement at {DEMO_REFERENCE_LOCATION.label}</span>
                    </label>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                variant="primary"
                disabled={registerMutation.isPending}
                loading={registerMutation.isPending}
                className="w-full font-semibold"
              >
                Register {vocab.noun} & Broadcast →
              </Button>
            </form>
          </div>
        ) : (
          /* Active Facility Workspace (2-Column Grid) */
          <div className="space-y-6">
            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-panel border border-line bg-white shadow-panel space-y-1">
                <span className="text-xs font-mono uppercase text-slate-500">Available {vocab.capacityNoun}</span>
                <div className="text-3xl font-bold font-mono text-teal-700">
                  {Math.max(0, facility.capacityTotal - capacityUsed)}
                </div>
                <span className="text-[11px] text-slate-400">Available for intake</span>
              </div>

              <div className="p-4 rounded-panel border border-line bg-white shadow-panel space-y-1">
                <span className="text-xs font-mono uppercase text-slate-500">Occupied {vocab.capacityNoun}</span>
                <div className="text-3xl font-bold font-mono text-ink-950">{capacityUsed}</div>
                <span className="text-[11px] text-slate-400">Currently assigned</span>
              </div>

              <div className="p-4 rounded-panel border border-line bg-white shadow-panel space-y-1">
                <span className="text-xs font-mono uppercase text-slate-500">Total Registered Capacity</span>
                <div className="text-3xl font-bold font-mono text-slate-700">{facility.capacityTotal}</div>
                <span className="text-[11px] text-slate-400">{vocab.capacityNoun} licensed</span>
              </div>
            </div>

            {/* Main 2-Column: Left Management (5 cols) | Right Map (7 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Capacity Control Form */}
              <div className="lg:col-span-5 space-y-5">
                <div className="p-6 rounded-panel border border-line bg-white shadow-panel space-y-5">
                  <div className="flex items-center justify-between pb-2 border-b border-line">
                    <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-800">
                      Live Capacity Management
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-100 text-blue-800 font-bold">
                      Editable
                    </span>
                  </div>

                  {updateFeedback && (
                    <div
                      className={`p-3 rounded-control text-xs flex items-center gap-2 ${
                        updateFeedback.includes('✓')
                          ? 'bg-teal-50 border border-teal-200 text-teal-800'
                          : 'bg-coral-50 border border-coral-200 text-coral-800'
                      }`}
                    >
                      {updateFeedback.includes('✓') ? <IconCheck width={15} height={15} /> : <IconAlertCircle width={15} height={15} />}
                      <span>{updateFeedback}</span>
                    </div>
                  )}

                  {/* Progress Meter */}
                  <CapacityMeter
                    used={Number(capacityUsed)}
                    total={facility.capacityTotal}
                    unit={vocab.capacityNoun.toLowerCase()}
                    status={status}
                  />

                  {/* Slider Control */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Adjust Used {vocab.capacityNoun}:</span>
                      <span className="font-mono text-sm text-blue-700 font-bold">
                        {capacityUsed} / {facility.capacityTotal}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={facility.capacityTotal}
                      value={capacityUsed}
                      onChange={(e) => setCapacityUsed(e.target.value)}
                      className="w-full accent-blue-700 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                    />

                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-xs text-slate-500 font-medium shrink-0">Exact Value:</span>
                      <Input
                        type="number"
                        min="0"
                        max={facility.capacityTotal}
                        value={capacityUsed}
                        onChange={(e) => setCapacityUsed(e.target.value)}
                        className="w-28 text-center font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Operational Status */}
                  <div className="space-y-1.5 pt-2 border-t border-line">
                    <label className="block text-xs font-semibold text-slate-700 uppercase font-mono">
                      Operational Status:
                    </label>
                    <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                      {vocab.statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <Button
                    size="lg"
                    variant="primary"
                    onClick={() => updateMutation.mutate()}
                    loading={updateMutation.isPending}
                    className="w-full font-mono text-xs uppercase"
                  >
                    Broadcast Live Capacity Update →
                  </Button>

                  <p className="text-[11px] text-slate-400 font-mono leading-tight text-center">
                    Changes sync immediately across all connected EOC, responder, and citizen views via WebSocket.
                  </p>
                </div>

                {/* Facility Details (Read-only notice) */}
                <div className="p-5 rounded-panel border border-line bg-white shadow-panel space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-700">
                    Facility Record Information
                  </h3>
                  <div className="text-xs space-y-2 text-slate-600">
                    <div className="flex justify-between py-1 border-b border-line">
                      <span className="text-slate-400">Address:</span>
                      <span className="font-medium text-slate-800 text-right truncate max-w-[220px]">
                        {facility.location?.address}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-line">
                      <span className="text-slate-400">Emergency Phone:</span>
                      <span className="font-mono font-semibold text-blue-700">{facility.contactPhone}</span>
                    </div>
                    <div className="py-1">
                      <span className="text-slate-400 block mb-1">Resources on File:</span>
                      <div className="flex flex-wrap gap-1">
                        {facility.resources?.map((r, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-50 border border-line text-[11px] text-slate-500 leading-normal">
                    <strong>Notice:</strong> Physical address, contact number, and total licensed capacity cannot be altered through the live operational endpoint.
                  </div>
                </div>
              </div>

              {/* Right Column: Regional Map View */}
              <div className="lg:col-span-7 space-y-3">
                <div className="p-5 rounded-panel border border-line bg-white shadow-panel space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-line">
                    <h3 className="text-xs font-mono font-bold uppercase text-slate-700">
                      Regional Situation Map
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      Your facility highlighted with surrounding incidents
                    </span>
                  </div>

                  <IncidentMap
                    incidents={allIncidents}
                    facilities={allFacilities}
                    height="540px"
                    showLegend={true}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FacilityLayout>
  );
}
