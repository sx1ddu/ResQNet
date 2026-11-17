# User journeys

## Citizen reports emergency (supported)
1. Sign in; auth context silently refreshes when needed.
2. Open `/citizen/report`, choose SOS or standard.
3. Enter title, description, category, optional address.
4. Browser geolocation attempts to capture device coordinates.
5. On description blur, `/ai/classify` may return suggested category/severity/summary/source.
6. Submit `/incidents`; backend runs AI analysis, duplicate detection, trust scoring and possible escalation.
7. Current UI navigates to `/citizen` on success; redesigned confirmation should use returned incident record.
8. `incident:new` and possible `incident:escalated` are broadcast.

**Safety caveat:** current form silently uses jittered Mumbai demo coordinates when geolocation unavailable. Resolve before production; never imply a real location was captured.

## Citizen finds facilities (supported with limitations)
Fetch `/facilities`; show type/name/address/capacity/status/contact/resources. Optional client-side distance sorting if coordinates exist. No server-side nearby/radius filter.

## EOC reviews incident (supported)
Sign in → `/eoc` → fetch incidents/facilities/situation summary → severity filter/escalation → select queue/map item → inspect details → PATCH status → server response/socket updates.

## EOC verifies incident (supported)
Inspect trust components, crowd votes, AI source/confidence, authority state → PATCH `/incidents/:id/authority-verify` with confirmed/rejected and optional note → backend recomputes trust; rejection sets incident status rejected → `incident:update`.

## EOC broadcasts (supported)
Compose ≤500-character message and severity → preview/confirm critical → POST `/alerts` → global `alert:new` → dismiss via PATCH; `alert:dismissed` includes ID. No targeting, receipts or history; GET returns latest five active.

## Rescue handles incident (supported)
Approved rescue account → own assignments and unassigned high/critical list → self-assign with own user ID and status dispatched → update assigned incident to dispatched/in_progress/resolved. No live GPS, route navigation, SLA or vehicle tracking.

## Hospital/shelter updates capacity (supported)
Approved account registers one facility if none exists → update `capacityUsed` and status → PATCH capacity endpoint → `facility:update`. Existing API cannot edit resources/contact/address/total capacity later.

## EOC reviews organization (supported)
GET `/users/directory` → select pending record → GET `/users/:id/document` → inspect image → PATCH `/users/:id/verify-document` approved/rejected + note. EOC/admin only. Approval gates rescue incident management and facility operations.

## Proposed journeys

Historical alert review, notification preferences, profile editing, analytics and citizen-owned incident detail require backend/security work as described in compatibility docs.
