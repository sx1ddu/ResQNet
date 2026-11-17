# Complete sitemap

**EXISTING** = routed now. **PROPOSED** = new route. **BACKEND REQUIRED** = new server capability/security review needed.

| Route | Page | Access | Status / support |
|---|---|---|---|
| `/` | Landing | Public | EXISTING |
| `/login` | Login | Public | EXISTING; auth endpoints |
| `/register` | Register | Public | EXISTING; public roles only |
| `/citizen` | Citizen overview | citizen/volunteer/ngo | EXISTING |
| `/citizen/report` | Incident report | citizen/volunteer/ngo | EXISTING |
| `/citizen/facilities` | Facility directory | citizen/volunteer/ngo | PROPOSED; FRONTEND ONLY via GET facilities; no geo endpoint |
| `/citizen/reports/:id` | Citizen incident detail | citizen/volunteer/ngo | PROPOSED; SECURITY/BACKEND REVIEW because GET by ID has no owner check |
| `/eoc` | Command center | eoc/admin | EXISTING |
| `/eoc/incidents/:id` | Incident detail | eoc/admin | PROPOSED; FRONTEND ONLY via existing incident endpoints |
| `/eoc/directory` | Emergency directory | eoc/admin | PROPOSED; FRONTEND ONLY via users/facilities |
| `/eoc/verification` | Organization verification | eoc/admin | PROPOSED; FRONTEND ONLY via directory/document/review endpoints |
| `/eoc/broadcasts` | Broadcast management | eoc/admin | PROPOSED; PARTIAL, active-only API |
| `/eoc/analytics` | Analytics | eoc/admin | PROPOSED; BACKEND REQUIRED aggregation/time-series |
| `/rescue` | Rescue field console | rescue_team | EXISTING |
| `/rescue/incidents/:id` | Assigned incident detail | rescue_team | PROPOSED; FRONTEND ONLY, server permissions authoritative |
| `/hospital` | Hospital workspace | hospital | EXISTING |
| `/shelter` | Shelter workspace | shelter | EXISTING |
| `/profile` | Read-only profile | Authenticated | PROPOSED; FRONTEND ONLY for GET `/auth/me`; editing needs backend |
| `/help/preparedness` | Preparedness guide | Public/authenticated | PROPOSED; FRONTEND ONLY static reviewed content |
| `/help/accessibility` | Accessibility/help | Public/authenticated | PROPOSED; FRONTEND ONLY |
| `/settings/notifications` | Notification preferences | Authenticated | PROPOSED; BACKEND REQUIRED |
| `/alerts` | Active alerts | Authenticated | PROPOSED; PARTIAL, latest 5 active only |
| `*` | Not found | Public | PROPOSED; replace redirect-to-landing |

## Route notes

Keep all current URLs and role allowlists. Do not add a role switcher. EOC is not publicly registerable. Citizen incident detail must not be released until authorization and data disclosure are reviewed: current `GET /api/incidents/:id` requires authentication but has no owner check in the controller. New route role guards are not a substitute for backend security.
