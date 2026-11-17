# ResQNet — Civic Response Command redesign

**Deliverable:** source-grounded design blueprint and 16 static visual references. **Source:** uploaded `ResQNet-main(4).zip` snapshot. **Scope:** documentation/prototypes only; no production code or backend changes.

## Creative direction

**Civic Response Command** pairs a calm, accessible citizen experience with a precise, information-dense EOC workspace. Warm paper surfaces, ink/navy structure, cobalt actions, restrained signal coral, and independent severity/trust/status vocabularies replace the current split black/red console and cream public identity.

## Design principles

1. Clarity before spectacle; one dominant job and next action per screen.
2. Calm urgency; critical incidents stand out without making every page alarming.
3. Severity, response status, and trust are separate concepts.
4. Map plus textual queue/detail; maps are never the only way to access information.
5. AI is an advisory source, not ground truth.
6. Connectivity, data freshness, and offline tile caching are described honestly.
7. Preserve current API contracts, role restrictions, auth lifecycle, Leaflet, TanStack Query, and Socket.IO events.

## Documents

- `PRODUCT_AND_UI_AUDIT.md` — source-level inventory and UX audit.
- `DESIGN_VISION.md`, `DESIGN_SYSTEM.md` — creative direction and tokens.
- `INFORMATION_ARCHITECTURE.md`, `COMPLETE_SITEMAP.md` — role navigation and routes.
- `PAGE_BY_PAGE_DESIGN_SPEC.md`, `COMPONENT_LIBRARY.md` — page/component designs.
- `INTERACTION_AND_MOTION_SPEC.md`, `RESPONSIVE_DESIGN_SPEC.md`, `ACCESSIBILITY_SPEC.md` — behavior and quality.
- `FEATURE_AND_BACKEND_COMPATIBILITY.md` — API, events, permissions, unsupported ideas.
- `USER_JOURNEYS.md`, `MAP_AND_DATA_VISUALIZATION_SPEC.md` — workflows and maps.
- `VISUAL_REFERENCE_GUIDE.md` — prototype index.
- `IMPLEMENTATION_HANDOFF.md` — Anti-Gravity file-by-file plan.
- `DESIGN_QA_CHECKLIST.md` — acceptance criteria.

## Recommended reading order

Audit → compatibility → vision/system → IA/sitemap → page specs/components → interactions/responsive/accessibility/maps/journeys → handoff → QA.

## View prototypes

Open `visual-references/README.md`, then open an HTML file directly in a browser. Prototypes use local CSS only. Map-like visuals are explicitly static/illustrative, not live maps. Sample data is fictional.

## Evidence and limits

All frontend files and relevant backend routes/controllers/models/services were inspected from the supplied archive. This was a source-level audit, not a live browser/API test. No dependencies were installed. No source files outside this design directory were changed. Runtime behavior is not claimed where it was not executed.
