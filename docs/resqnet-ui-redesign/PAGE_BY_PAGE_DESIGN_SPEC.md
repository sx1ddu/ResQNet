# Page-by-page design specification

All data views need loading, empty, error, stale/reconnecting and permission-blocked states. Keep severity, status and trust independent.

## Existing pages

### Landing `/`
Public editorial hero: asymmetric copy/product preview; role strip; report→review→respond→facility workflow; features and footer. CTA: create account/sign in. No live counters, customer logos, testimonials or guaranteed-response claims. Responsive: stack hero, keep CTA visible, static preview labelled illustrative.

### Login `/login`
POST `/auth/login`, refresh cookie lifecycle, GET `/auth/me`. Split brand/form on desktop; single column mobile. Email/password, password reveal, validation, rate-limit/error/offline state. Preserve original protected-route redirect and role redirect. Demo shortcuts only if demo seed credentials are valid.

### Register `/register`
Public roles: citizen, rescue_team, hospital, shelter, volunteer, ngo; EOC/admin not public. Fields: name/email/password/role; org name where current form exposes; phone accepted by backend but not currently shown. Controller requires verification image for all non-citizen roles, including volunteer. PNG/JPEG/WebP, max 2MB, base64 data URI. Explain pending review and gated actions. Handle file read/type/size, duplicate email, rate-limit errors.

### Citizen `/citizen`
Queries: own incidents, all incidents, all facilities; browser location attempt; incident/facility socket invalidation; shared alerts/assistant. Hierarchy: alert → report CTA → local situation map/list → own reports → facilities → emergency contacts. Never expose reporter GPS trust details or deployment quantities. Mobile: alert/report first, expandable map, bottom nav.

### Report `/citizen/report`
POST `/incidents`; POST `/ai/classify`. Fields: SOS/standard type, title, description, category, optional address; incident `lng/lat`; optional reporter coordinates when geolocation captured. Flow: type → describe → confirm location/provenance → optional AI suggestion → submit → confirmation. **Critical defect:** current code silently substitutes jittered Mumbai demo coordinates when geolocation is unavailable. Resolve before production: require explicit confirmation of any demo fallback or implement a real manual coordinate flow. Do not show pin-dragging as currently supported. AI preview must be marked advisory and show source. Handle detecting/live/denied, preview failure, submit failure/success, duplicate-merged response.

### EOC `/eoc`
Roles eoc/admin. Data: all incidents, facilities, deterministic situation summary, alerts; incident socket events; current refresh safety nets 30s incidents and 20s summary. Desktop: queue + map + selected inspector; top status rail; escalation always visible. Inspector: description, location, reporter/assigned team when returned, AI summary/source, resource recommendations/ETA, trust components, crowd votes, authority decision, timeline. Status update existing. EOC assignment supported server-side but absent from current UI; adding selector is frontend work only if verified rescue-team IDs are obtained. Tablet/mobile use queue/detail tabs and focused map.

### Rescue `/rescue`
Role rescue_team. Assigned incidents and unassigned high/critical incidents. Self-assign only unassigned urgent by sending own ID and `status=dispatched`; approved org required. Progress assigned incident to dispatched/in_progress/resolved; cannot reassign. Authority verify only assigned incident and approved org. Mobile-first, large actions; map in focused sheet. No GPS tracking or route navigation.

### Hospital `/hospital`
Shared FacilityDashboard variant. First registration fields: name/address/total capacity/phone/resources/geolocation. Approved organization and one facility per account. Existing facility: capacityUsed/total, percent, status operational/full/closed, map. Update endpoint changes only capacityUsed/status; don't present other profile fields as editable.

### Shelter `/shelter`
Same shared layout; use occupants rather than beds; resources are free-text. Same approval and facility API constraints.

## Proposed pages

### Incident detail `/eoc/incidents/:id`, `/rescue/incidents/:id` (P1)
Full inspection view: header, map/location, timeline, AI source/summary, trust evidence, status/action rail. Use GET by ID and existing status/crowd/authority endpoints. FRONTEND ONLY for EOC/rescue; citizen detail requires owner authorization review.

### Facility/emergency directory `/eoc/directory`, `/citizen/facilities` (P1)
Map/list, type filters, name/address/phone/capacity/status. EOC also shows role and document status via users directory. FRONTEND ONLY; client distance sort only, no server radius search.

### Organization verification `/eoc/verification` (P1)
Pending queue, selected org, lazy-loaded document, approve/reject and optional note. GET directory, GET document, PATCH verify-document. FRONTEND ONLY; EOC/admin only.

### Broadcast management `/eoc/broadcasts` (P1)
Compose ≤500 chars, severity info/warning/critical, preview, critical confirmation, active list and dismiss. PARTIAL: GET returns latest five active only; no history.

### Alerts `/alerts` (P2)
Authenticated active-alert view. FRONTEND ONLY for active list; historical archive/read receipts/targeting need backend.

### Profile `/profile` (P2)
Read-only account/role/org/verification/phone/location from `/auth/me`. Editing, safety status toggle, password/document changes require backend.

### Preparedness/help `/help/preparedness`, `/help/accessibility` (P2)
Curated static, reviewed guidance with source/date; not AI functionality. FRONTEND ONLY.

### Analytics `/eoc/analytics` (later)
Incident trend/category/status aging/capacity snapshot. BACKEND REQUIRED aggregation, time ranges, pagination; do not derive historical trends from current list.

### Notification settings `/settings/notifications` (later)
BACKEND REQUIRED; no preferences, delivery, push or SMS API.

### 404 `*` (P1)
Accessible not-found page with route home/sign-in. FRONTEND ONLY.
