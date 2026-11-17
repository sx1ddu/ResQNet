# Information architecture

## Role mental models

- **Public visitor:** understand the service → learn the roles → sign in/create account.
- **Citizen / volunteer / NGO:** Today → Report → My reports → Nearby facilities → Help. These roles currently share `/citizen` and `/citizen/report`.
- **EOC/admin:** Situation → Incidents → Facilities/directory → Verification → Broadcasts. Queue is the primary work surface.
- **Rescue team:** My assignment → Assignment detail → Progress update → Available urgent work. No general dispatch-management privileges.
- **Hospital/shelter:** Facility status → Capacity → Facility details → Regional context. Shared layout, different nouns/resources.

## Role navigation

### Public
ResQNet logo; How it works (anchor); Sign in; Create account.

### Citizen
Overview `/citizen`; Report `/citizen/report`; Nearby facilities (proposed `/citizen/facilities`); My reports (overview section); Preparedness (proposed `/help/preparedness`); Profile (proposed read-only `/profile`).

### EOC/admin
Command `/eoc`; incident detail `/eoc/incidents/:id` (proposed); directory `/eoc/directory` (proposed); organization review `/eoc/verification` (proposed); broadcasts `/eoc/broadcasts` (proposed); analytics (future/backend required).

### Rescue
Field console `/rescue`; incident detail `/rescue/incidents/:id` (proposed); available urgent incidents as a section.

### Hospital/shelter
Facility overview `/hospital` or `/shelter`; profile sections; regional map section.

## Shared chrome
Brand/role title; connection state (connected/reconnecting/offline); last update; active broadcast banner; user menu/logout; assistant entry; skip-to-main.

## Navigation behavior

- EOC persistent left rail on desktop, drawer on narrow screens.
- Citizen mobile bottom nav: Overview, Report, Facilities, Help.
- Rescue mobile top bar + Assigned/Available tabs; focused detail view.
- Facility mobile shows capacity/status first.
- Breadcrumbs on EOC detail and review pages; avoid deep nesting.

## Search limitations

No general search endpoint exists. EOC assistant parses natural-language incident filters and returns at most 10 incidents. Other filtering can be local over fetched lists; do not claim global cross-entity search.
