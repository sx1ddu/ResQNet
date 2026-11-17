# Interaction and motion specification

## Core principles

Actions are explicit and produce server-confirmed feedback. No hover-only controls. Motion is subordinate to emergency information. Every mutation has pending/success/failure states.

## Interaction contracts

| Action | Behavior | Feedback/safety |
|---|---|---|
| Select incident | Queue/map/inspector select same record | Selection outline and map focus; keyboard parity |
| Severity filter | Filter fetched incident list | Active filter/count/clear action |
| EOC status update | Advance allowed response workflow | Server response authoritative; confirm terminal action |
| Rescue self-assign | Only unassigned urgent; own ID + `status=dispatched` | Eligibility explanation and success confirmation |
| Authority verify | `confirmed` or `rejected`, optional note | Confirm action; rejection sets incident status rejected |
| Crowd verify | `confirm`/`dispute`, one vote per user, changeable | Show current vote and refreshed trust state |
| Broadcast | Message ≤500 chars, severity enum, preview | Critical message gets second confirmation showing exact text |
| Dismiss alert | EOC/admin only | Confirm; remove via `alert:dismissed` event |
| Facility update | `capacityUsed` and `status` only | Validate 0..total; show result and socket update |
| Facility registration | type/name/location/capacity/resources/contact | Approved org required; location provenance visible |
| Document upload | PNG/JPEG/WebP ≤2MB as data URI | Type/size/read errors; no fake cloud progress |
| AI classify | Current behavior triggers after sufficient text on description blur | Loading; failure doesn't block report; advisory source shown |
| Assistant | Citizen advice + optional nearest shelter; EOC/rescue filter max 10 | Not dispatch; only returned results/actions |
| Offline tiles | Radius options 2/5/10km | Progress/result; explicitly no offline report queue/navigation |
| Location | Browser permission and provenance | Separate incident and device location; no silent demo coordinate |

## Realtime

Use exact events: `incident:new`, `incident:update`, `incident:escalated`, `facility:new`, `facility:update`, `alert:new`, `alert:dismissed`. Patch/invalidate TanStack Query caches. Socket disconnected means data may be stale; show last successful update and remove “live” label. Server broadcasts globally, not by role/geography.

## Motion tokens

Fast feedback 100–140ms; drawer 180–220ms; modal 160–200ms; map focus 250–350ms with reduced-motion alternative. Easing `cubic-bezier(.2,.8,.2,1)`. No animated background, chart drawing, or continuous beacon pulse.

## Recovery

Preserve form values on failure. Don't navigate away until report success. Socket loss retains cached data with connection warning. Failed capacity update restores server value. Verification rejection preserves review note for retry.
