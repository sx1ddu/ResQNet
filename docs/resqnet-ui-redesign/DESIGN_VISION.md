# Design vision — Civic Response Command

## Product positioning

ResQNet is a shared operational picture for people reporting emergencies and teams coordinating a response. It should feel like civic infrastructure: dependable, calm, transparent, direct. Not a military command console, social network, generic SaaS dashboard, or AI chatbot.

## Brand idea

**Civic Response Command**: one clear view of what has been reported, where it is, how urgent it appears, how it is being verified, and what response stage it has reached.

## Principles

1. Clarity before spectacle; every view has a primary job and action.
2. Calm urgency; high-severity information stands out without making all UI alarming.
3. Evidence over assertion; AI, crowd, GPS consistency and authority are separate signals.
4. Role-specific depth; citizens see what helps them act, operators see operational evidence, responders see assignments first.
5. Map plus record; every map view has a textual list/detail alternative.
6. Honest connectivity; show connection and freshness, distinguish tile cache from API availability.
7. Operational restraint; no fake KPIs, decorative charts or fictional integrations.

## Visual signature

Warm light surfaces for public/citizen/facility workflows; deep ink shell for EOC; cobalt for ordinary actions; signal coral reserved for critical urgency; teal for positive/operational states; editorial headings, highly legible body text, compact monospaced IDs/timestamps, subtle grid/coordinate details. Modest 8–12px geometry, not pill-shaped everything.

## Palette starting points

| Token | Hex | Use |
|---|---|---|
| Ink 950 | `#101B2A` | Strong text/EOC shell |
| Ink 800 | `#1E3044` | Navigation/dark surfaces |
| Blue 700 | `#2457C5` | Primary action/selection |
| Blue 100 | `#E8F0FF` | Soft action surface |
| Coral 700 | `#C94B3C` | Critical signal/emergency CTA |
| Coral 100 | `#FCEBE8` | Critical background |
| Teal 700 | `#19796F` | Confirmed/operational |
| Teal 100 | `#E4F3F0` | Positive background |
| Amber 700 | `#98620A` | High/attention |
| Amber 100 | `#FBF1D8` | Attention background |
| Paper | `#F6F7F5` | Main light background |
| White | `#FFFFFF` | Elevated surfaces |
| Line | `#DCE2E7` | Borders |
| Slate 600 | `#5D6B78` | Secondary text |

Validate all contrast pairs before implementation. Severity, trust and response status must not share one semantic palette.

## Typography

Use Inter or Geist Sans for UI, IBM Plex Mono for IDs/coordinates/timestamps, and restrained Manrope for public headings. Use tabular numerals for counts/capacity. Dense tables use interface font, not display font.

## Role modes

- **Citizen:** light, calm, plain language, prominent report action, no internal GPS trust scores or deployment quantities.
- **EOC/admin:** dark ink shell, compact queue/map/inspector, persistent connection/freshness, no constant animation.
- **Rescue:** mobile-first, large touch targets, assignment-first, no route guidance/GPS tracking.
- **Hospital/shelter:** light operational workspace, capacity/status first, separate bed vs occupant terminology.

## Quality references (not templates)

Linear for hierarchy, Stripe for forms, Apple for public usability, Vercel for precise metadata, Notion for grouping. Do not copy their visual identities or layouts.

## Avoid

Purple AI gradients, glowing orbs, robot art, random glassmorphism, excessive rounded cards, decorative charts without data, fake live maps, fictional stats/logos/testimonials, permanent pulsing, military clichés.
