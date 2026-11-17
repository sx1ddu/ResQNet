# Design system specification

## Tokens

```css
:root {
 --ink-950:#101B2A; --ink-800:#1E3044; --ink-700:#2C4055;
 --blue-700:#2457C5; --blue-100:#E8F0FF;
 --coral-700:#C94B3C; --coral-100:#FCEBE8;
 --teal-700:#19796F; --teal-100:#E4F3F0;
 --amber-700:#98620A; --amber-100:#FBF1D8;
 --paper:#F6F7F5; --surface:#FFFFFF; --line:#DCE2E7;
 --text:#172433; --text-secondary:#5D6B78; --text-muted:#788694;
 --surface-dark:#172536; --surface-dark-raised:#203247;
}
```

| Semantic concept | Foreground / surface | Non-color cue |
|---|---|---|
| Critical severity | coral 700 / coral 100 | alert glyph + “Critical” |
| High severity | amber 700 / amber 100 | triangle + “High” |
| Medium severity | dark gold / pale amber | dot + “Medium” |
| Low severity | teal 700 / teal 100 | check/circle + “Low” |
| Info | blue 700 / blue 100 | info glyph + “Info” |
| Verified trust | teal 700 / teal 100 | shield-check + “Verified” |
| Highly trusted | ink/teal | shield-check + exact label |
| Pending trust | slate / slate 100 | clock + “Pending” |
| Suspicious trust | coral / coral 100 | flag + “Suspicious” |
| In progress | blue / blue 100 | progress glyph + text |
| Resolved | teal / teal 100 | check + text |
| Facility full | amber / amber 100 | capacity glyph + “Full” |
| Facility closed | slate / slate 100 | pause glyph + “Closed” |

Never conflate severity, trust and response status. Color is supplementary; label and shape always remain.

## Type scale

| Style | Size/line-height | Weight | Use |
|---|---|---|---|
| Display | 40/48 desktop; 32/38 mobile | 650 | Landing hero only |
| H1 | 28/36 | 650 | Page title |
| H2 | 20/28 | 620 | Section |
| H3 | 16/24 | 620 | Panel |
| Body | 14/22 | 400 | Default |
| Body small | 13/19 | 400 | Secondary |
| Label | 12/16 | 600 | Forms/compact headings |
| Micro | 11/16 | 500 | Metadata only |
| Numeric | 28–36/1 | 650 tabular | Counts/capacity |
| Mono metadata | 11–12/16 | 500 | IDs/coordinates/time |

Inter/Geist Sans for UI; IBM Plex Mono for metadata; Manrope optional for editorial heading. Avoid display face in tables.

## Spacing, geometry, breakpoints

4px grid: `4,8,12,16,20,24,32,40,48,64,80`. Max content width 1440px. Gutters 32px desktop, 24px laptop, 16px mobile. Panel radius 10px, controls 8px, badge radius 4px. Borders 1px; shadows only for overlays.

Breakpoints: 640, 768, 1024, 1280, 1536px. EOC changes from 3 zones to queue/detail tabs at tablet; mobile uses focused views.

## Layout primitives

- Public: 64–72px header, editorial content, footer.
- Citizen: compact top bar, report CTA, main content, bottom mobile navigation.
- EOC: 60px top rail + 248px collapsible left rail; queue 320–360px, map flexible, inspector 360–400px at wide desktop. Queue/inspector collapse independently.
- Rescue: mobile-first, assignment list and focused detail; map as separate tab/sheet.
- Facility: 2-column management overview, map secondary.

## Component styling

- Buttons: primary blue; critical action coral; secondary outlined; tertiary text. Heights 44px default, 48px primary emergency, 40px compact. Verb-first labels. Explain disabled permission states.
- Inputs: persistent label, min 44px, error below field, visible focus. Do not rely on placeholder.
- Incident row: severity rail; title/category/location/time; status and trust in separate slots; escalation marker only when true.
- Trust/status badges: include text and glyph; tooltip explains signal and does not call it ground truth.
- Capacity meter: used/total/percent plus text. Threshold colors are visual conventions, not backend facility status transitions.
- Tables: sticky header only for long desktop lists; stack rows on mobile.
- Drawers: side inspector desktop, full-screen/bottom sheet mobile.
- Alert banner: high contrast, no permanent pulse; citizen view read-only.
- Assistant: “Safety guidance” or “Incident search”; clarify it is not emergency dispatch.
- Map markers: category icon, severity border, selected outer ring; trust is not encoded in marker color.

## Themes and elevation

Public/citizen/auth/facility light by default. EOC ink/dark by default. Rescue high-contrast light. Keep semantic meaning consistent between themes. Z-index: base 0, sticky header 20, map controls 30, dropdown 40, drawer 60, modal 80, toast 100.

## Motion and icons

Hover/focus 120ms; drawer 180–220ms; queue selection 120ms; map focus 250–350ms. Easing `cubic-bezier(.2,.8,.2,1)`. No animated backgrounds or continuous pulse. Use one outline icon set, 1.75px stroke, 18px default. Pair icons with text.
