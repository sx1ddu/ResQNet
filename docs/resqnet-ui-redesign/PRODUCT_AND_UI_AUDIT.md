# Product and existing UI audit

## Inspection scope

Inspected the supplied archive: all files under `frontend/`, backend route definitions, controllers, Mongoose models, auth middleware, AI/chat/duplicate/trust services, Socket.IO setup, README and deployment documentation. The frontend has 10 page components, 12 reusable components, two contexts, Axios client, two utilities, global CSS, Tailwind/Vite config, HTML entry and service worker. Audit is source-level; no running browser screenshot was available.

## Existing route inventory

| Route | Page | Access | Actual purpose |
|---|---|---|---|
| `/` | Landing | Public | Product introduction and auth links |
| `/login` | Login | Public | Email/password, role redirect, demo-account fill |
| `/register` | Register | Public | Role selection, organization data and verification image |
| `/citizen` | CitizenDashboard | citizen/volunteer/ngo | Own reports, all incidents/map, facilities, emergency contacts; shared alerts/assistant |
| `/citizen/report` | ReportIncident | citizen/volunteer/ngo | SOS/standard report, title, description, category, address, geolocation, AI preview |
| `/eoc` | EOCDashboard | eoc/admin | Incident queue/map, severity filters, escalation, status progression, summary, facilities, broadcasts |
| `/rescue` | RescueDashboard | rescue_team | Assigned incidents, unassigned high/critical incidents, self-assign, progress |
| `/hospital` | HospitalDashboard | hospital | Wrapper around FacilityDashboard, hospital variant |
| `/shelter` | ShelterDashboard | shelter | Wrapper around FacilityDashboard, shelter variant |
| `*` | Landing fallback | Public | Unknown paths redirect to landing; no 404 |

There are 9 explicit route declarations plus wildcard. EOC is not a public registration role. Admin shares EOC. Volunteer/NGO use the citizen dashboard.

## Page-by-page source audit

| File | Existing responsibility | Redesign requirement |
|---|---|---|
| `pages/Landing.jsx` | Hero, role summary, register/login | Distinctive editorial product story and honest product preview |
| `pages/Login.jsx` | Credentials, loading/error, demo fill, redirect | Accessible split layout; demo accounts only if seeded |
| `pages/Register.jsx` | Name/email/password/role/org/document | Role-aware form; explain pending review and file constraints |
| `pages/CitizenDashboard.jsx` | Geolocation, own/all incidents, facilities, socket invalidation | Alert-first dashboard, report CTA, local situation, reports, facilities |
| `pages/ReportIncident.jsx` | SOS/standard, title/description/category/address, location, classify preview, submit | Short stress-safe flow and transparent location provenance |
| `pages/EOCDashboard.jsx` | Incidents, facilities, deterministic summary, severity filter, escalation, status | Queue/map/inspector workbench; avoid competing cards |
| `pages/RescueDashboard.jsx` | Assigned/available urgent incidents, map, self-assign, resolve | Mobile-first assignment workspace and eligibility states |
| `pages/FacilityDashboard.jsx` | Facility registration, capacity/status, map | Shared shell with distinct hospital/shelter semantics |
| `pages/HospitalDashboard.jsx` | Thin wrapper with hospital type | Keep wrapper; variant copy belongs in shared component |
| `pages/ShelterDashboard.jsx` | Thin wrapper with shelter type | Keep wrapper; use occupant language |

## Reusable components

| File | Existing responsibility | Redesign direction |
|---|---|---|
| `AlertBanner.jsx` | Fetch and display active alerts | Restrained high-signal banner; read-only for non-EOC |
| `AssistantChat.jsx` | Floating citizen advice / dispatcher incident search | Accessible docked panel with role-specific label and limitations |
| `EmergencyContacts.jsx` | Static India helplines 112/100/101/108/1078/1091 | Clear tap-to-call rows, India scope visible |
| `EmergencyDirectory.jsx` | EOC organization/facility directory | Structured rows, status/capacity/document state |
| `IncidentCard.jsx` | Incident, severity/trust, AI summary, resources, crowd/authority actions | Separate severity/status/trust; explicit action controls |
| `IncidentMap.jsx` | React Leaflet incident/facility markers, selection/fly-to | Legend, map/list sync, accessible textual alternative |
| `IssueAlertPanel.jsx` | Create/dismiss broadcasts | Preview and critical confirmation; active-only limit |
| `Navbar.jsx` | Brand, logout, connection, alert and assistant | Role-specific shells; replace incorrect “CrisisGrid” wordmark |
| `OfflineMapControl.jsx` | 2/5/10km OSM tile cache download | Explain tile-only offline behavior and progress |
| `ProtectedRoute.jsx` | Auth loading, login redirect, role allowlist | Preserve access control; improve loading/denied states |
| `SeverityBadge.jsx` | Severity primitive | Text + icon/shape semantic indicator |
| `TrustBadge.jsx` | Trust-state primitive | Keep independent from severity and workflow status |

## Infrastructure inventory

| File | Responsibility | Guidance |
|---|---|---|
| `App.jsx` | Routes/role guards | Add approved routes without changing existing allowlists |
| `main.jsx` | React root, QueryClient and providers | Preserve provider order/cache |
| `api/axiosClient.js` | Axios, in-memory access token, refresh retry queue | Preserve auth mechanics exactly |
| `context/AuthContext.jsx` | Silent refresh, `/auth/me`, login/register/logout | No visual redesign; preserve lifecycle |
| `context/SocketContext.jsx` | Single JWT-authenticated socket | Preserve single connection and token handshake |
| `utils/roleRouting.js` | Role-to-dashboard mapping | Keep EOC/admin→`/eoc`, rescue→`/rescue`, hospital/shelter routes, default→`/citizen` |
| `utils/offlineMap.js` | OSM tile URL/cache logic | Preserve logic; redesign control only |
| `styles/index.css` | Tailwind, Leaflet size, focus, reduced motion | Replace visual tokens but retain map sizing/focus/reduced motion |
| `tailwind.config.js` | Console/field palette, brand, fonts, pulse | Replace with semantic tokens after CSS plan |
| `vite.config.js` | Vite React config | No change expected |
| `index.html` | Document metadata/title | Set ResQNet title/description/theme color |
| `public/sw.js` | OSM tile cache service worker | Preserve caching; version migration deliberately |
| `package.json`/lock | React 18, Vite, Tailwind and dependencies | No new packages required |

## Backend/data architecture verified

- **User:** name, email, role (`citizen`, `eoc`, `rescue_team`, `hospital`, `shelter`, `volunteer`, `ngo`, `admin`), organizationName, GeoJSON location, phone, safetyStatus, verificationDocument metadata/status.
- **Incident:** type (`sos`, `incident_report`, `missing_person`, `resource_request`), title, description, category, severity, status, location, reporter, assigned team, AI analysis, crowd votes, authority verification, trust score/state, escalation, duplicateOf, imageUrl, timeline.
- **Facility:** hospital/shelter, name, location/address, capacityTotal/Used, free-text resources, phone, manager, status, occupancyPercent virtual.
- **Alert:** message, severity info/warning/critical, issuer, active, timestamps.

## Important implementation truths

- `GET /api/facilities` is declared before `router.use(protect)`, so it is public at route layer.
- All incident routes require authentication; POST incident has no route-level role allowlist.
- Incident list filters are exact `status`, `severity`, `category`, `mine=true`; no pagination or spatial search.
- Rescue self-assigns only unassigned high/critical incident with own user ID and `status=dispatched`; approved verification required. Rescue can progress assigned incidents to dispatched/in_progress/resolved only.
- EOC/admin may assign only a verified rescue-team account, but current EOCDashboard does not show an assignment selector.
- Crowd verification is one vote per authenticated non-reporter; vote may be changed. Authority verification is EOC/admin or assigned approved rescue.
- Situation summary is deterministic counts, not a generative briefing.
- AI classify uses Gemini with fallback (`gemini`, `mock`, `none` source). Chat gives citizens rule-based advice/nearest shelter when coordinates supplied; EOC/admin/rescue natural-language incident filter, max 10 results.
- Alerts endpoint returns latest five active only. No history, geotargeting, user targeting, receipts.
- Facility update endpoint changes only capacityUsed/status. No edit endpoint for contact/resources/address/total capacity.
- Verification-document retrieval and user directory are EOC/admin only.

## Socket events verified

Server authenticates sockets with JWT in `socket.handshake.auth.token` and broadcasts globally via `io.emit`, with no rooms/geofencing. Events: `incident:new` (created incident), `incident:update` (status/crowd/authority), `incident:escalated` (creation escalation), `facility:new`, `facility:update`, `alert:new`, `alert:dismissed` (`{_id}`). No client-to-server socket commands.

## UX findings inferred from source (not browser screenshots)

1. Brand inconsistency: Tailwind defines black/red console and cream public palette; Navbar literally says “CrisisGrid” instead of ResQNet.
2. EOC combines queue, map, escalation, summary, directory and broadcasts; needs a clear operational hierarchy.
3. No dedicated incident detail route; selected incident is list/map state.
4. Wildcard route silently redirects to Landing.
5. Report and facility registration silently use jittered Mumbai coordinates when geolocation is unavailable. This is a serious location-provenance defect; never hide it in redesigned UI.
6. Report form has no manual map pin adjustment; don't imply it exists.
7. Empty/loading/error/stale states need consistent treatment.
8. EOC assignment is backend-supported but not exposed in current page UI.
9. Facility profile fields are not editable after registration via current API.
10. No profile edit endpoint, alert history, analytics aggregation, notification preferences, push/SMS, per-user delivery, or geotargeting.
11. Offline map caches OSM tiles only; it does not queue incident reports or provide turn-by-turn navigation.
12. All socket events are globally emitted; UI must not claim targeted delivery.

## Audit conclusion

The real product already supports a coherent core: role-based auth, reporting, AI-assisted classification, duplicate detection, trust scoring, incident status, rescue self-assignment, facility capacity, broadcasts, organization verification, maps, offline tile cache, and realtime updates. The redesign should make these workflows clear without inventing dispatch integrations or unsupported product scope. Prioritize EOC, citizen reporting/dashboard, rescue mobile, and facility capacity management.
