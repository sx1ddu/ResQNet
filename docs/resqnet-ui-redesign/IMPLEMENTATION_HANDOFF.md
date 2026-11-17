# Anti-Gravity implementation handoff

## Objective

Implement the Civic Response Command design across the full React frontend while preserving backend contracts and every existing workflow. Use HTML prototypes as visual references, not production code.

## Non-negotiable rules

1. Preserve API paths/methods/payloads, role permissions, auth refresh, and exact socket events.
2. Do not invent GPS tracking, navigation, SMS/push, analytics, alert history, advanced inventory, patient records or messaging.
3. Fix the silent Mumbai fallback before production: never submit demo coordinates without explicit user acknowledgement or a verified manual location mechanism.
4. Never expose `reporterLocation`; model serializer intentionally removes it.
5. Keep React 18, Vite, Router, TanStack Query, Axios, Leaflet/React Leaflet and Socket.IO client unless separately justified.
6. Keep every existing route functional.

## Suggested architecture

```text
src/
  app/                 # routes/providers
  api/                 # existing axiosClient + endpoint functions
  components/ui/       # buttons, fields, badges, dialogs, toasts, skeletons
  components/navigation/
  components/incidents/ # queue, inspector, timeline, trust breakdown
  components/map/       # Leaflet map, markers, legend
  components/facilities/
  components/alerts/
  components/assistant/
  layouts/              # public, citizen, EOC, rescue, facility
  pages/                # existing + approved new pages
  hooks/                # query/mutation/socket cache integration
  context/              # preserve auth/socket contexts
  styles/               # tokens.css, globals.css
  utils/                # preserve offlineMap and roleRouting
```

This is a suggested organization, not a mandate to rewrite all modules at once.

## File-by-file coverage matrix

| Existing file | Responsibility | Redesign? | Change guidance / critical behavior |
|---|---|---:|---|
| `frontend/src/App.jsx` | Routes/guards | Structural | Keep current paths/allowlists; add approved detail/directory/verification/broadcast/help/404 routes |
| `frontend/src/main.jsx` | Root/providers/QueryClient | No/possible | Preserve provider order and cache configuration |
| `frontend/src/api/axiosClient.js` | Axios token + refresh queue | No | Preserve in-memory access token, httpOnly refresh cookie, retry-once logic |
| `components/AlertBanner.jsx` | Active alert UI | Yes | Keep active API/event; non-EOC read-only; no history |
| `components/AssistantChat.jsx` | Role-aware assistant | Yes | Keep chat payload, optional citizen coordinates, role branches, max-10 results |
| `components/EmergencyContacts.jsx` | India helplines | Yes | Keep numbers and tel links; explicit India scope |
| `components/EmergencyDirectory.jsx` | EOC directory | Yes | Keep directory data; fetch document separately/lazily |
| `components/IncidentCard.jsx` | Incident summary/actions | Yes | Preserve crowd/authority APIs and permission logic; separate selection from action buttons |
| `components/IncidentMap.jsx` | Leaflet map/markers | Yes | Preserve OSM, coordinate order, fly-to/selection; no fake tracking |
| `components/IssueAlertPanel.jsx` | Broadcast issue/dismiss | Yes | Preserve endpoints/severity enum; add critical preview/confirmation |
| `components/Navbar.jsx` | Brand/logout/connection/global alert/chat | Yes | Replace “CrisisGrid” with ResQNet; split role nav; keep logout/alert/assistant behavior |
| `components/OfflineMapControl.jsx` | Tile download | Yes | Preserve radius/progress/errors; describe tile-only offline scope |
| `components/ProtectedRoute.jsx` | Auth/role gate | States only | Preserve guard/redirect origin; never weaken authorization |
| `components/SeverityBadge.jsx` | Severity primitive | Yes | Keep four values; add text/icon/shape |
| `components/TrustBadge.jsx` | Trust primitive | Yes | Keep states; don't conflate severity/status |
| `context/AuthContext.jsx` | Auth lifecycle | No | Preserve silent refresh, `/auth/me`, login/register/logout, token memory |
| `context/SocketContext.jsx` | Single authenticated socket | No/minor | Preserve JWT handshake and single connection |
| `pages/CitizenDashboard.jsx` | Citizen overview | Yes | Preserve own/all incidents, facilities, location and socket invalidation |
| `pages/EOCDashboard.jsx` | EOC operations | Yes | Preserve filters/escalation/summary/status/realtime; assignment selector only with verified team IDs |
| `pages/FacilityDashboard.jsx` | Shared facility workflow | Yes | Preserve registration/capacity/status payloads and socket updates; no unsupported edit fields |
| `pages/HospitalDashboard.jsx` | Hospital wrapper | Minimal | Keep `facilityType="hospital"`; bed-specific copy |
| `pages/Landing.jsx` | Public marketing | Yes | New identity; no fictional claims/stats/logos |
| `pages/Login.jsx` | Login/demo fill | Yes | Preserve redirects; demo accounts only if seed confirms |
| `pages/Register.jsx` | Role/document registration | Yes | Preserve public roles, file types/size, data URI contract and pending review |
| `pages/ReportIncident.jsx` | Incident reporting | Yes | Preserve payload/classify preview; fix silent fallback location policy |
| `pages/RescueDashboard.jsx` | Rescue queue/map/self-assign | Yes | Preserve assignment restrictions and allowed transitions; mobile-first |
| `pages/ShelterDashboard.jsx` | Shelter wrapper | Minimal | Keep `facilityType="shelter"`; occupant language |
| `styles/index.css` | Global CSS/Leaflet/focus/reduced motion | Yes | Replace palette; retain Leaflet sizing, focus and reduced-motion rules |
| `utils/offlineMap.js` | OSM tile/cache logic | No | Preserve calculations/cache; no offline-report claim |
| `utils/roleRouting.js` | Role route mapping | No/minor | Preserve current mappings; extend only for approved routes |
| `frontend/tailwind.config.js` | Theme tokens/fonts | Yes | Replace console/field palette with semantic tokens |
| `frontend/index.html` | HTML metadata | Minor | ResQNet title/description/theme color/favicon |
| `frontend/public/sw.js` | OSM tile service worker | No/minor | Preserve cache semantics; version migration deliberate |
| `frontend/vite.config.js` | Vite config | No | Preserve |
| `frontend/package.json` + lock | Dependencies/scripts | No | No package additions required |
| `frontend/postcss.config.js` | PostCSS | No | Preserve |
| `frontend/.env.example` | Env contract | No | Preserve API URL variable; no secrets |
| `frontend/Dockerfile`, `Dockerfile.prod` | Build/runtime | No | Preserve deployment behavior |
| `frontend/.dockerignore` | Build context | No | Preserve unless new required asset paths dictate |

Inspect any additional files/assets in the implementation checkout before changing them; the above is the complete inventory in the supplied archive.

## New routes/modules

P1: EOC/rescue incident detail, EOC directory, EOC organization verification, EOC broadcasts, citizen facility directory, accessible 404. P2: active alert center, read-only profile, static preparedness/accessibility. Do not implement analytics, notification settings, profile edits, historical alerts or citizen-owned incident detail without backend/security work.

## Implementation sequence

1. Add semantic CSS tokens and primitives; validate contrast.
2. Implement shared buttons/fields/badges/dialogs/toasts/skeletons/empty/error.
3. Implement role-specific shells; fix CrisisGrid naming.
4. Redesign landing/login/register.
5. Redesign citizen dashboard/report; resolve fallback location safety.
6. Redesign EOC queue/map/inspector; preserve selection and realtime cache.
7. Add incident detail, directory, verification and broadcast routes.
8. Redesign rescue mobile-first.
9. Redesign shared facility workspace with distinct hospital/shelter language.
10. Redesign offline map control, alert and assistant.
11. Responsive/accessibility pass.
12. Build, route/role/API/socket regression.

## Data integration

Keep TanStack Query as server-state source. Use stable query keys for incidents/facilities/alerts/directory/documents. Patch from authoritative mutation response or invalidate targeted keys. Keep API calls in hooks/services. When socket disconnected, show cached data and freshness. Do not invent socket event names.

## Acceptance criteria

All existing routes/features work; no API payload or permission changes; role navigation correct; no fake map/GPS/notifications/analytics; location fallback cannot silently submit demo coordinates; EOC sees severity/status/trust/AI source/timeline distinctly; rescue restrictions remain; facility updates limited to supported fields; mobile works at 320px; keyboard/screen-reader/reduced-motion checks pass; `npm run build` and route smoke tests pass.
