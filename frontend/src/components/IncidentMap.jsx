import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SeverityIndicator, TrustIndicator } from './ui/Indicators.jsx';

const SEVERITY_COLORS = {
  critical: '#C94B3C',
  high: '#98620A',
  medium: '#C28A28',
  low: '#19796F',
};

const CATEGORY_SYMBOLS = {
  flood: '🌊',
  fire: '🔥',
  earthquake: '🏚️',
  medical: '🚑',
  structural: '🏗️',
  other: '⚠️',
};

const FADED_STATUSES = ['resolved', 'rejected', 'merged'];

function createIncidentIcon(incident, isSelected = false) {
  const color = SEVERITY_COLORS[incident.severity] || SEVERITY_COLORS.medium;
  const emoji = CATEGORY_SYMBOLS[incident.category] || CATEGORY_SYMBOLS.other;
  const isFaded = FADED_STATUSES.includes(incident.status);
  const isCritical = incident.severity === 'critical' && !isFaded;

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative; width:36px; height:36px; display:flex; align-items:center; justify-content:center;
                  opacity:${isFaded ? 0.4 : 1}; filter:${isFaded ? 'grayscale(0.8)' : 'none'}; cursor:pointer;">
        ${
          isSelected
            ? `<span style="position:absolute; width:44px; height:44px; border-radius:9999px; border:2.5px solid #2457C5; background:rgba(36,87,197,0.15); animation:pulse 1.5s infinite;"></span>`
            : ''
        }
        ${
          isCritical
            ? `<span style="position:absolute; width:36px; height:36px; border-radius:9999px; background:${color}; opacity:0.35; animation:pulse 1.8s infinite;"></span>`
            : ''
        }
        <span style="position:relative; width:28px; height:28px; border-radius:9999px; background:${color};
                     border:2.5px solid #FFFFFF; box-shadow:0 3px 8px rgba(16,27,42,0.3);
                     display:flex; align-items:center; justify-content:center; font-size:13px; color:#FFFFFF;">
          ${emoji}
        </span>
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function createFacilityIcon(type = 'hospital') {
  const isHospital = type === 'hospital';
  const color = isHospital ? '#2457C5' : '#19796F';
  const symbol = isHospital ? '🏥' : '🏠';

  return L.divIcon({
    className: '',
    html: `
      <div style="width:24px; height:24px; border-radius:6px; background:${color};
                  border:2px solid #FFFFFF; box-shadow:0 2px 6px rgba(16,27,42,0.25);
                  display:flex; align-items:center; justify-content:center; font-size:12px; cursor:pointer;">
        ${symbol}
      </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

function AutoCenterOnData({ targetCenter, zoom }) {
  const map = useMap();
  const hasCentered = useRef(false);

  useEffect(() => {
    if (!targetCenter || hasCentered.current) return;
    map.setView(targetCenter, zoom);
    hasCentered.current = true;
  }, [targetCenter, zoom, map]);

  return null;
}

function FlyToIncident({ incidentId, incidents, markerRefs }) {
  const map = useMap();

  useEffect(() => {
    if (!incidentId) return;
    const incident = incidents.find((i) => i._id === incidentId);
    if (!incident || !incident.location?.coordinates) return;

    const [lng, lat] = incident.location.coordinates;
    map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.8 });

    const timer = setTimeout(() => {
      markerRefs.current[incidentId]?.openPopup();
    }, 550);

    return () => clearTimeout(timer);
  }, [incidentId, incidents, map, markerRefs]);

  return null;
}

function computeDataCenter(incidents, facilities) {
  const points = [
    ...incidents.map((i) => i.location?.coordinates),
    ...facilities.map((f) => f.location?.coordinates),
  ].filter((c) => Array.isArray(c) && c.length === 2 && !isNaN(c[0]) && !isNaN(c[1]));

  if (points.length === 0) return null;

  const [lngSum, latSum] = points.reduce(([lng, lat], [pLng, pLat]) => [lng + pLng, lat + pLat], [0, 0]);
  return [latSum / points.length, lngSum / points.length];
}

export default function IncidentMap({
  incidents = [],
  facilities = [],
  center = [19.076, 72.8777],
  zoom = 12,
  height = '480px',
  onIncidentClick,
  flyToIncidentId = null,
  dark = false,
  showLegend = true,
}) {
  const dataCenter = computeDataCenter(incidents, facilities);
  const markerRefs = useRef({});

  return (
    <div
      style={{ height }}
      className={`relative rounded-panel overflow-hidden border ${
        dark ? 'border-surfaceDark-border bg-ink-950' : 'border-line bg-paper'
      }`}
    >
      {/* Top Banner Notice */}
      <div className="absolute top-2.5 left-2.5 z-[1000] px-2.5 py-1 rounded-badge bg-white/90 dark:bg-surfaceDark/90 backdrop-blur-xs text-[10px] font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 border border-line dark:border-surfaceDark-border shadow-xs">
        Map View · OpenStreetMap
      </div>

      <MapContainer
        center={dataCenter || center}
        zoom={zoom}
        scrollWheelZoom
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AutoCenterOnData targetCenter={dataCenter} zoom={zoom} />
        <FlyToIncident incidentId={flyToIncidentId} incidents={incidents} markerRefs={markerRefs} />

        {incidents.map((incident) => {
          if (!incident.location?.coordinates || incident.location.coordinates.length < 2) return null;
          const [lng, lat] = incident.location.coordinates;
          const isSelected = flyToIncidentId === incident._id;

          return (
            <Marker
              key={incident._id}
              position={[lat, lng]}
              icon={createIncidentIcon(incident, isSelected)}
              ref={(m) => {
                if (m) markerRefs.current[incident._id] = m;
              }}
              eventHandlers={{ click: () => onIncidentClick?.(incident) }}
            >
              <Popup>
                <div className="font-body text-xs text-slate-900 space-y-1.5 p-1 max-w-[240px]">
                  <div className="flex items-center justify-between gap-1">
                    <SeverityIndicator severity={incident.severity} />
                    <span className="font-mono text-[10px] uppercase text-slate-500">{incident.status}</span>
                  </div>
                  <h4 className="font-bold text-sm text-ink-950 leading-tight">{incident.title}</h4>
                  <p className="text-slate-600 line-clamp-2">{incident.description}</p>
                  <p className="font-mono text-[10px] text-slate-500">
                    📍 {incident.location?.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
                  </p>
                  {incident.verification && (
                    <div className="pt-1 border-t border-line">
                      <TrustIndicator verification={incident.verification} />
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {facilities.map((facility) => {
          if (!facility.location?.coordinates || facility.location.coordinates.length < 2) return null;
          const [lng, lat] = facility.location.coordinates;

          return (
            <Marker
              key={facility._id}
              position={[lat, lng]}
              icon={createFacilityIcon(facility.type)}
            >
              <Popup>
                <div className="font-body text-xs text-slate-900 space-y-1 p-1 max-w-[220px]">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] font-bold uppercase text-blue-700">
                      {facility.type}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 uppercase">{facility.status}</span>
                  </div>
                  <h4 className="font-bold text-sm text-ink-950">{facility.name}</h4>
                  <p className="text-slate-600">{facility.location?.address}</p>
                  <p className="font-mono text-xs font-semibold text-slate-800">
                    Capacity: {facility.capacityUsed} / {facility.capacityTotal}
                  </p>
                  {facility.contactPhone && (
                    <a
                      href={`tel:${facility.contactPhone}`}
                      className="inline-block text-[11px] font-mono text-blue-700 hover:underline pt-0.5"
                    >
                      📞 {facility.contactPhone}
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      {showLegend && (
        <div className="absolute bottom-2.5 left-2.5 z-[1000] p-2.5 rounded-panel bg-white/95 dark:bg-surfaceDark/95 backdrop-blur-xs text-[11px] font-mono border border-line dark:border-surfaceDark-border shadow-dropdown space-y-1">
          <div className="font-bold text-[10px] uppercase text-slate-500 mb-1">Incident Risk / Facilities</div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-coral-700" /> Critical
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-700" /> High
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-700" /> Low
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-blue-700" /> Hospital
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-teal-700" /> Shelter
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
