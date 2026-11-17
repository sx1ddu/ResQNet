# Feature and backend compatibility matrix

## Source-verified API inventory

| Method | Endpoint | Auth/role | Contract / behavior |
|---|---|---|---|
| POST | `/api/auth/register` | Public; citizen/rescue_team/hospital/shelter/volunteer/ngo | name,email,password,role,organizationName,phone,verificationDocument; returns user/accessToken and refresh cookie; non-citizen image required PNG/JPEG/WebP ≤2MB |
| POST | `/api/auth/login` | Public | email/password; returns user/accessToken and refresh cookie; rate limited |
| POST | `/api/auth/refresh` | Refresh cookie | Returns accessToken |
| POST | `/api/auth/logout` | Cookie | Clears refresh cookie/hash |
| GET | `/api/auth/me` | Authenticated | Returns current user |
| POST | `/api/incidents` | Authenticated; no route-level role allowlist | type,title,description,category,lng,lat,address,imageUrl,reporterLng,reporterLat; returns incident after AI, duplicate and trust logic |
| GET | `/api/incidents` | Authenticated | Filters: status,severity,category,mine=true; returns count/incidents; no pagination |
| GET | `/api/incidents/:id` | Authenticated | Returns populated incident; controller has no owner-specific check |
| PATCH | `/api/incidents/:id/status` | eoc/admin/rescue_team | status,note,assignedTeam; rescue restrictions; only verified rescue assignment; emits update |
| POST | `/api/incidents/:id/crowd-verify` | Authenticated except reporter | vote confirm/dispute; one mutable vote per user |
| PATCH | `/api/incidents/:id/authority-verify` | eoc/admin/rescue_team | status confirmed/rejected, note; rescue only assigned + approved; rejection sets incident status rejected |
| GET | `/api/facilities` | Public at route layer | Optional type filter; returns sorted facilities |
| GET | `/api/facilities/mine` | hospital/shelter | Returns facility or null |
| POST | `/api/facilities` | eoc/admin/hospital/shelter | type,name,lng,lat,address,capacityTotal,resources,contactPhone; approval/one-facility checks |
| PATCH | `/api/facilities/:id/capacity` | eoc/admin or owning approved hospital/shelter | capacityUsed,status only; validates capacity bounds |
| GET | `/api/ai/situation-summary` | eoc/admin | Deterministic summary/counts/totalOpen |
| POST | `/api/ai/classify` | Authenticated | title 3–160 chars, description 10–5000 chars; Gemini or fallback |
| POST | `/api/ai/chat` | Authenticated | message ≤1000 chars, optional lng+lat pair; citizen advice/nearest shelter or dispatcher search max 10 |
| GET | `/api/users/directory` | eoc/admin | Directory records with role, contact, doc status and facility for managed hospital/shelter |
| GET | `/api/users/:id/document` | eoc/admin | Returns user and verification image data URL |
| PATCH | `/api/users/:id/verify-document` | eoc/admin | status approved/rejected, optional note |
| GET | `/api/alerts/active` | Authenticated | Latest 5 active alerts only |
| POST | `/api/alerts` | eoc/admin | message ≤500 chars, severity info/warning/critical |
| PATCH | `/api/alerts/:id/dismiss` | eoc/admin | Sets active false |
| GET | `/api/health` | Public | Health endpoint in server |

## Realtime events

| Event | Payload | Trigger |
|---|---|---|
| `incident:new` | serialized incident | Incident creation |
| `incident:update` | serialized incident | Status/crowd/authority update |
| `incident:escalated` | serialized incident | Creation-time escalation |
| `facility:new` | facility | Facility creation |
| `facility:update` | facility | Capacity/status update |
| `alert:new` | alert | Broadcast creation |
| `alert:dismissed` | `{_id}` | Broadcast dismissal |

Socket connection uses JWT in handshake auth. Server uses global `io.emit`; no role rooms, geo targeting or client-to-server event handlers.

## Classification

| Feature | Classification | Grounded limitation |
|---|---|---|
| Authentication + silent refresh | EXISTING | Access token in memory; refresh cookie httpOnly |
| Role routing/guards | EXISTING | EOC/admin share; EOC not public signup |
| SOS/incident reporting | EXISTING | Current fallback silently uses jittered Mumbai coordinates if geolocation fails; fix before production |
| AI classification preview | EXISTING | Gemini with fallback; source must be shown |
| Duplicate detection | EXISTING | 500m radius + Jaccard similarity/category; duplicate marked merged |
| Incident map | EXISTING | Leaflet/OSM; no live responder GPS |
| EOC status workflow | EXISTING | UI advances reported→acknowledged→dispatched→in_progress→resolved; backend also allows merged/rejected |
| EOC assignment to rescue | PARTIAL | Backend supports verified team ID; current EOC UI lacks selector |
| Rescue self-assignment | EXISTING | Only unassigned urgent, approved org, self ID, dispatched status |
| Crowd verification | EXISTING | Authenticated non-reporter; one vote, changeable |
| Authority verification | EXISTING | EOC/admin or assigned approved rescue |
| Trust score | EXISTING | GPS 30%, crowd 25%, authority 25%, AI 20%; not ground truth |
| Situation summary | EXISTING (deterministic) | Counts/summary, not generative AI briefing |
| Citizen assistant | EXISTING | Rule-based guidance; nearest shelter only with location |
| EOC/rescue assistant search | EXISTING | Parsed incident filter, max 10 results |
| Active broadcasts | EXISTING | Latest 5 active, global broadcast, no targeting/history |
| Emergency directory | EXISTING/PARTIAL | EOC user directory + facilities; citizen can fetch facilities |
| Organization verification | EXISTING | Document retrieval and approve/reject note |
| Facility registration | EXISTING | One facility per hospital/shelter account; approval required |
| Facility capacity/status update | EXISTING | Only capacityUsed/status, no profile editing |
| Offline tile cache | EXISTING | OSM tiles only; no offline report queue/navigation |
| Dedicated incident detail | FRONTEND_ONLY | Existing GET/mutations; citizen ownership access needs security review |
| Dedicated facility directory | FRONTEND_ONLY | Existing facility API; no geo endpoint |
| Dedicated verification page | FRONTEND_ONLY | Existing directory/document/review APIs |
| Broadcast management | PARTIAL | Active list and issue/dismiss; no archive |
| Read-only profile | FRONTEND_ONLY | `/auth/me`; no edit |
| Profile edit/safety toggle | BACKEND_REQUIRED | No mutation endpoint |
| Historical alerts | BACKEND_REQUIRED | No history API |
| Notification preferences/push/SMS | BACKEND_REQUIRED | No delivery/preferences APIs |
| Operational analytics | BACKEND_REQUIRED | No aggregation/time-series API |
| GPS tracking/turn-by-turn/ambulance integration | PROPOSED | Not implemented |
| Advanced inventory/patient records/messaging | PROPOSED | Not implemented |

## Trust score details

Weights: GPS 30%, crowd 25%, authority 25%, AI 20%. Missing GPS neutral 50; no crowd votes 50; pending authority 40; missing AI confidence 50. Trust state: authority rejected→suspicious; score ≥85 plus authority confirmed→highly_trusted; score ≥60→verified; score ≤30→suspicious; otherwise pending. Display component scores and neutral/no-signal explanation. Never call the score a probability.

## Security/display guardrails

`reporterLocation` is removed from incident JSON serialization. Never expose it. Do not assume incident GET-by-ID enforces ownership. Load verification document only through EOC/admin endpoint when selected; do not fetch all document images in directory list. Frontend hiding is not authorization.
