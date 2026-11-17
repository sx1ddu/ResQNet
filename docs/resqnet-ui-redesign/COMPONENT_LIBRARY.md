# Component library

Components receive explicit role/data props; API policy lives in hooks/services, not presentation components.

| Component | Purpose | States | Responsive/accessibility |
|---|---|---|---|
| AppShell | Header, role nav, main, connection rail | auth/loading/offline | Landmarks, skip link |
| PublicHeader | Brand, anchors, auth CTAs | default/mobile menu | Keyboard menu/focus |
| RoleNavigation | Role-specific links | expanded/collapsed/active | Drawer on mobile, aria-current |
| ConnectionStatus | Socket state | connected/reconnecting/offline | Text + icon, not color only |
| AlertBanner | Broadcast message/severity | info/warning/critical/dismissed | Live announcement; citizen read-only |
| SeverityIndicator | Severity text/icon/shape | low/medium/high/critical | Label always visible |
| TrustIndicator | Trust state/score | pending/suspicious/verified/highly trusted | Explain signals; not ground truth |
| StatusPill | Incident workflow status | all status values | Text + icon |
| IncidentQueueItem | Selectable incident summary | default/selected/escalated | 44px target, keyboard selectable |
| IncidentInspector | Selected incident detail/actions | loading/empty/error/loaded | Drawer on tablet/mobile |
| IncidentTimeline | Status/note/actor/time | empty/loaded | Ordered list semantics |
| TrustBreakdown | GPS/crowd/authority/AI scores | available/neutral/missing | Explain neutral baselines; never expose reporter coordinate |
| MapWorkspace | Leaflet map + legend + filters | loading/tiles missing/offline/selected | Textual list alternative |
| FacilityMarker | Hospital/shelter map symbol | type/status | Distinct from incident markers |
| FacilityCapacity | Used/total/percentage | normal/near-full/full/closed | Numeric text and status |
| FacilityDirectoryRow | Facility details/contact/capacity | loading/empty/error | Stacked on phone; tel link |
| BroadcastComposer | Message/severity/preview | editing/confirming/sending/error/success | ≤500 chars; critical confirmation |
| VerificationQueueItem | Organization/role/doc state | pending/approved/rejected | Keyboard action/status text |
| DocumentViewer | Lazy document image | loading/loaded/error | Alt text, no auto-open |
| AssistantPanel | Citizen advice / dispatcher search | closed/open/loading/error/results | Dialog semantics, focus trap, Escape |
| EmergencyContactList | India helplines | default | `tel:` links and country context |
| OfflineMapControl | Tile radius/download progress | idle/downloading/done/error | Clarify tile cache ≠ offline reporting |
| ReportTypeSelector | SOS vs standard | selected/unselected | Radio semantics |
| LocationStatus | Device/incident location provenance | detecting/live/denied/fallback confirmed | Never silently submit fallback |
| AIClassificationPreview | Suggested category/severity/summary/source | idle/loading/result/unavailable | Advisory label/source |
| FormField | Label/input/help/error | default/focus/error/disabled | Label and error association |
| EmptyState | No data + next action | role-specific | Clear CTA |
| ErrorState | Failure + retry | recoverable/fatal | Plain language |
| Skeleton | Loading placeholder | loading | aria-busy/reduced motion |
| Toast | Mutation result | success/warning/error | Live region, not sole error channel |
| Dialog | Confirm dangerous action | open/closed | Focus trap, Escape, labelled title |

## Contracts

- Do not nest interactive controls inside clickable queue rows.
- AI panels show source (`gemini`, `mock`, `none`) and generated time when available.
- Backend authorization remains authoritative; disabled controls explain why.
- If trust score is shown, call it a system-derived trust signal, not a probability.
- Offline tile cache status is distinct from API/socket status.
