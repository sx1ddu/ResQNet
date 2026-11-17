# Map and data visualization specification

## Map role and architecture

Map is a geographic index/selection surface, never the sole operational interface. Keep Leaflet + React Leaflet + OpenStreetMap; no paid provider required. Keep attribution visible and follow OSM tile usage policy.

## Layers and markers

- Incidents: category icon; severity via border/fill plus text legend; resolved/rejected/merged visually de-emphasized as current map does.
- Facilities: distinct hospital/shelter symbols; status in popup/detail, not marker color alone.
- Selected item: strong outer ring synchronized with queue.
- User location only when permission granted; never expose private `reporterLocation`.

Category icons: flood/drop, fire/flame, earthquake/ground alert, medical/cross, structural/building, other/pin. Facility icons: hospital/building vs shelter/home. Trust must not color markers.

## Container and controls

Desktop min height 480px in EOC workspace; mobile focused full-screen map. Compact controls: zoom, valid-center recenter, legend/filter. Popup concise; full detail in inspector. Avoid custom clustering unless implemented/tested; not in current source.

## Legend and visualizations

Legend explains category icons, severity labels, facility types, selected state, faded resolved/closed state. Capacity displays used/total/percent with beds vs occupants. Incident counts use only returned summary/local filtered count and are labelled. Trust shows components and neutral/no-signal explanations. AI confidence shows source and remains advisory. No trend charts until time-series API exists.

## Offline

`offlineMap.js` calculates OSM tile URLs and caches tiles via Cache API; service worker intercepts OSM tile requests. It does not make APIs, report submission, chat, broadcasts or navigation work offline. Distinguish “map tiles cached” from “ResQNet online”; show radius (2/5/10km), progress, success/failure and cached area.

## Prototypes

Map-like backgrounds are CSS illustrations explicitly labelled **Illustrative map — not live**. They are not Leaflet maps or live tiles.
