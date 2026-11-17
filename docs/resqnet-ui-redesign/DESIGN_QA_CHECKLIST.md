# Design QA checklist

## Coverage
- [ ] All 9 explicit routes remain functional.
- [ ] All 10 page components redesigned or intentionally retained as wrappers.
- [ ] All 12 shared components accounted for.
- [ ] Every frontend infra/config/asset file appears in handoff matrix.
- [ ] New pages classified and justified; 404 replaces silent redirect.

## Role and permissions
- [ ] Citizen/volunteer/NGO use citizen workspace.
- [ ] EOC/admin use command center; EOC not public signup.
- [ ] Rescue only self-assigns unassigned urgent incidents and updates assigned incidents.
- [ ] Hospital/shelter manage own facility; approval requirement clear.
- [ ] Document review EOC/admin only; frontend visibility not treated as security.

## Functionality/backend
- [ ] Auth login/register/refresh/logout preserved.
- [ ] Incident create/classify/duplicate/escalation states represented.
- [ ] Crowd and authority verification work.
- [ ] Status and rescue self-assignment restrictions preserved.
- [ ] Facility registration/capacity/status work.
- [ ] Broadcast create/dismiss and active list work.
- [ ] Assistant role behavior and offline tile cache accurately described.
- [ ] No invented endpoints/payloads/roles.
- [ ] No analytics/history/preferences/profile edit/push/SMS/GPS routing without backend.
- [ ] `reporterLocation` never exposed; citizen incident detail authorization reviewed.

## Visual and responsive
- [ ] Brand says ResQNet consistently, not CrisisGrid.
- [ ] Severity/status/trust distinct and non-color-coded.
- [ ] EOC queue/map/inspector hierarchy clear.
- [ ] Citizen interface calm/action-oriented.
- [ ] Rescue mobile actions large and reachable.
- [ ] Hospital beds vs shelter occupants correct.
- [ ] No horizontal overflow at 320px; test tablet/EOC transitions and 200% zoom.

## Accessibility/data safety
- [ ] WCAG AA contrast, keyboard focus, semantic labels, screen-reader live regions.
- [ ] Reduced motion; no hover-only critical actions.
- [ ] Map has textual alternative; touch targets ≥44px/critical ≥48px.
- [ ] Loading/empty/error/success/stale/offline/permission states exist.
- [ ] AI source/advisory status visible; trust not presented as probability.
- [ ] Location fallback never silently sends Mumbai demo coordinates.
- [ ] OSM attribution and offline tile limitations remain clear.
- [ ] Static prototypes labelled illustrative; sample metrics not presented as real.

## Realtime/regression
- [ ] JWT socket handshake and exact event names unchanged.
- [ ] Disconnect/reconnect freshness visible; no duplicate socket.
- [ ] Query cache updates on mutations/events.
- [ ] Protected routes/role guards remain intact.
- [ ] Production build and route smoke tests pass.
