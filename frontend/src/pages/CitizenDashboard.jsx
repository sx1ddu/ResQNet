import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import CitizenLayout from '../layouts/CitizenLayout.jsx';
import IncidentMap from '../components/IncidentMap.jsx';
import IncidentCard from '../components/IncidentCard.jsx';
import EmergencyContacts from '../components/EmergencyContacts.jsx';
import OfflineMapControl from '../components/OfflineMapControl.jsx';
import { CapacityMeter } from '../components/ui/Indicators.jsx';
import Button from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import {
  IconAlertOctagon,
  IconMapPin,
  IconBuilding,
  IconActivity,
  IconClock,
  IconShieldCheck,
  IconSparkles,
} from '../components/ui/Icons.jsx';

const FALLBACK_CENTER = [19.076, 72.8777];

export default function CitizenDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [myLocation, setMyLocation] = useState(FALLBACK_CENTER);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMyLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setMyLocation(FALLBACK_CENTER),
      { timeout: 6000 }
    );
  }, []);

  const { data: myIncidentsData, isLoading: loadingMine } = useQuery({
    queryKey: ['incidents', 'mine'],
    queryFn: async () => (await api.get('/incidents?mine=true')).data,
  });

  const { data: allIncidentsData, isLoading: loadingAll } = useQuery({
    queryKey: ['incidents', 'all'],
    queryFn: async () => (await api.get('/incidents')).data,
  });

  const { data: facilitiesData, isLoading: loadingFacilities } = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => (await api.get('/facilities')).data,
  });

  // Socket updates
  useEffect(() => {
    if (!socket) return;
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    };
    socket.on('incident:new', invalidate);
    socket.on('incident:update', invalidate);
    socket.on('facility:update', invalidate);
    return () => {
      socket.off('incident:new', invalidate);
      socket.off('incident:update', invalidate);
      socket.off('facility:update', invalidate);
    };
  }, [socket, queryClient]);

  const myIncidents = myIncidentsData?.incidents || [];
  const allIncidents = allIncidentsData?.incidents || [];
  const facilities = facilitiesData?.facilities || [];

  return (
    <CitizenLayout>
      <div className="space-y-6">
        {/* Page Header / Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase text-blue-700 tracking-wider mb-1">
              Citizen Workspace · Local Situation
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-950 tracking-tight">
              Good day, {user?.name}. Stay informed and safe.
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Verified community reports, relief shelters, hospital bed availability, and official broadcasts.
            </p>
          </div>

          <Link to="/citizen/report" className="shrink-0">
            <Button size="lg" variant="critical" icon={<IconAlertOctagon width={20} height={20} />} className="w-full sm:w-auto shadow-md">
              ＋ Report an Incident / SOS
            </Button>
          </Link>
        </div>

        {/* 3 Metric Stat Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-panel border border-line bg-white shadow-panel space-y-1">
            <span className="text-xs font-mono font-semibold uppercase text-slate-500">Your Reports</span>
            <div className="text-3xl font-bold font-mono text-ink-950">{myIncidents.length}</div>
            <span className="text-[11px] text-slate-400">Tracked with live status</span>
          </div>

          <div className="p-4 rounded-panel border border-line bg-white shadow-panel space-y-1">
            <span className="text-xs font-mono font-semibold uppercase text-slate-500">Open Incidents Nearby</span>
            <div className="text-3xl font-bold font-mono text-blue-700">
              {allIncidents.filter((i) => i.status !== 'resolved').length}
            </div>
            <span className="text-[11px] text-slate-400">Coordinated by EOC</span>
          </div>

          <div className="p-4 rounded-panel border border-line bg-white shadow-panel space-y-1">
            <span className="text-xs font-mono font-semibold uppercase text-slate-500">Available Facilities</span>
            <div className="text-3xl font-bold font-mono text-teal-700">{facilities.length}</div>
            <span className="text-[11px] text-slate-400">Hospitals & shelters listed</span>
          </div>
        </div>

        {/* Map & My Reports 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Map & Offline Cache Control */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-panel border border-line bg-white shadow-panel space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-ink-950">Regional Situation Map</h2>
                  <p className="text-xs text-slate-500">
                    Pins represent reported hazards and nearby relief shelters/hospitals.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-100 text-blue-800 font-bold">
                  Live View
                </span>
              </div>

              <IncidentMap
                incidents={allIncidents}
                facilities={facilities}
                center={myLocation}
                height="440px"
              />
            </div>

            <OfflineMapControl center={myLocation} />
          </div>

          {/* Right Column: Citizen's Own Reports & Emergency Helplines */}
          <div className="lg:col-span-5 space-y-4">
            {/* My Reports */}
            <div className="p-5 rounded-panel border border-line bg-white shadow-panel space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-line">
                <h2 className="text-sm font-bold uppercase tracking-wide font-mono text-slate-800">
                  My Reports ({myIncidents.length})
                </h2>
                <Link to="/citizen/report" className="text-xs font-semibold text-blue-700 hover:underline">
                  + New report
                </Link>
              </div>

              {myIncidents.length === 0 ? (
                <EmptyState
                  title="No reports submitted"
                  description="When you file a report or send an SOS, it will appear here with live response tracking from rescue teams."
                  action={
                    <Link to="/citizen/report">
                      <Button size="sm" variant="primary">
                        Submit a Report
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {myIncidents.map((incident) => (
                    <IncidentCard key={incident._id} incident={incident} />
                  ))}
                </div>
              )}
            </div>

            {/* Direct India Emergency Helplines */}
            <EmergencyContacts />
          </div>
        </div>

        {/* Nearby Facilities Overview */}
        <div className="p-6 rounded-panel border border-line bg-white shadow-panel space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-line">
            <div>
              <h2 className="text-base font-bold text-ink-950">Nearby Hospitals & Emergency Shelters</h2>
              <p className="text-xs text-slate-500">
                Check current bed and occupant capacity before travelling.
              </p>
            </div>
            <Link to="/citizen/facilities">
              <Button size="sm" variant="secondary">
                View Full Directory & Map →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.slice(0, 6).map((fac) => (
              <div
                key={fac._id}
                className="p-4 rounded-control border border-line bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase font-bold text-blue-700 block mb-0.5">
                      {fac.type === 'hospital' ? '🏥 Hospital' : '🏠 Relief Shelter'}
                    </span>
                    <h4 className="font-bold text-sm text-ink-950 truncate">{fac.name}</h4>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold shrink-0 ${
                      fac.status === 'operational'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {fac.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 truncate">
                  📍 {fac.location?.address || 'Address on file'}
                </p>

                <CapacityMeter
                  used={fac.capacityUsed}
                  total={fac.capacityTotal}
                  unit={fac.type === 'hospital' ? 'beds' : 'occupants'}
                  status={fac.status}
                />

                {fac.contactPhone && (
                  <div className="pt-2 border-t border-line text-xs font-mono">
                    <a href={`tel:${fac.contactPhone}`} className="text-blue-700 font-semibold hover:underline">
                      📞 {fac.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            ))}

            {facilities.length === 0 && (
              <p className="col-span-full text-center py-6 text-xs text-slate-500 font-mono">
                No facilities registered in the regional directory yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
