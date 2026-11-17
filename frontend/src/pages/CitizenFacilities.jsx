import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import CitizenLayout from '../layouts/CitizenLayout.jsx';
import IncidentMap from '../components/IncidentMap.jsx';
import { CapacityMeter } from '../components/ui/Indicators.jsx';
import {
  IconBuilding,
  IconBed,
  IconHome,
  IconPhone,
  IconSearch,
  IconMapPin,
  IconFilter,
} from '../components/ui/Icons.jsx';

export default function CitizenFacilities() {
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => (await api.get('/facilities')).data,
  });

  const facilities = data?.facilities || [];

  const filtered = facilities.filter((fac) => {
    const matchesType = !typeFilter || fac.type === typeFilter;
    const nameMatch =
      !search ||
      fac.name.toLowerCase().includes(search.toLowerCase()) ||
      (fac.location?.address || '').toLowerCase().includes(search.toLowerCase());
    return matchesType && nameMatch;
  });

  return (
    <CitizenLayout>
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-mono font-bold uppercase text-blue-700 tracking-wider mb-1">
            Community Safety Resources
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-950 tracking-tight">
            Emergency Facilities Directory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Current bed occupancy for hospitals and occupant capacity for relief shelters across the region.
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="p-4 rounded-panel border border-line bg-white shadow-panel flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <IconSearch width={16} height={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by facility name or address…"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-control border border-line focus:outline-none focus:ring-1 focus:ring-blue-700 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono text-slate-500 uppercase font-semibold">Filter:</span>
            <div className="flex gap-1.5">
              {[
                { label: 'All Types', value: '' },
                { label: 'Hospitals', value: 'hospital' },
                { label: 'Shelters', value: 'shelter' },
              ].map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => setTypeFilter(chip.value)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-control border transition-colors ${
                    typeFilter === chip.value
                      ? 'bg-blue-700 text-white border-blue-700 font-bold'
                      : 'border-line text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2-Column Map & Directory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Facilities List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 pb-1">
              <span>Showing {filtered.length} facilities</span>
              <span>Sorted by region</span>
            </div>

            {isLoading && (
              <p className="text-center py-12 text-xs font-mono text-slate-400">Loading facility records…</p>
            )}

            <div className="space-y-3">
              {filtered.map((fac) => {
                const isHospital = fac.type === 'hospital';
                return (
                  <div
                    key={fac._id}
                    className="p-5 rounded-panel border border-line bg-white shadow-panel space-y-3 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              isHospital
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {isHospital ? '🏥 Hospital' : '🏠 Relief Shelter'}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                              fac.status === 'operational'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {fac.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-ink-950">{fac.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <IconMapPin width={13} height={13} className="shrink-0" />
                          <span>{fac.location?.address || 'Location on file'}</span>
                        </p>
                      </div>

                      {fac.contactPhone && (
                        <a
                          href={`tel:${fac.contactPhone}`}
                          className="px-3 py-1.5 rounded-control bg-slate-100 hover:bg-blue-700 hover:text-white text-ink-950 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                          title="Call facility"
                        >
                          <IconPhone width={13} height={13} />
                          <span>Call</span>
                        </a>
                      )}
                    </div>

                    <CapacityMeter
                      used={fac.capacityUsed}
                      total={fac.capacityTotal}
                      unit={isHospital ? 'beds' : 'occupants'}
                      status={fac.status}
                    />

                    {fac.resources?.length > 0 && (
                      <div className="pt-2 border-t border-line flex flex-wrap gap-1.5">
                        <span className="text-[10px] font-mono uppercase text-slate-400 self-center">
                          Services:
                        </span>
                        {fac.resources.map((res, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700"
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {!isLoading && filtered.length === 0 && (
                <div className="p-8 text-center rounded-panel border border-dashed border-line bg-white text-slate-500 space-y-2">
                  <IconBuilding width={28} height={28} className="mx-auto text-slate-400" />
                  <p className="text-sm font-semibold">No facilities found</p>
                  <p className="text-xs">Try adjusting your search query or filter selection.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Facilities Map */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="p-5 rounded-panel border border-line bg-white shadow-panel space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-line">
                <h3 className="text-xs font-mono font-bold uppercase text-slate-700">
                  Regional Map View
                </h3>
                <span className="text-[10px] font-mono text-slate-400">OpenStreetMap</span>
              </div>
              <IncidentMap facilities={filtered} height="520px" showLegend={true} />
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
