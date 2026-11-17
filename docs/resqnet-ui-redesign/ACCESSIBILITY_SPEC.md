# Accessibility and high-stakes usability

Target WCAG 2.2 AA baseline with additional emergency-use safeguards.

## Visual and cognitive

- Body contrast ≥4.5:1; large text and essential UI graphics ≥3:1.
- Severity, status, trust always have text and icon/shape; color supplemental.
- Critical instructions are never tiny metadata. Support 200% zoom.
- One primary action per view; plain language; no unexplained abbreviations.
- No countdowns/auto-dismiss for critical info, flashing or continuous motion.

## Keyboard/focus

- All navigation, forms, dialogs, incident actions, and map-adjacent lists keyboard-operable.
- Visible focus ring ≥2px; logical order; focus returns to trigger after dialog.
- No hover-only actions. Add skip-to-main.

## Screen readers

- Semantic landmarks/headings, labelled controls, `aria-describedby` for errors/help.
- Mutation results and submission state announced via polite live region.
- New critical alert may be announced assertively once; don't repeat unchanged alerts.
- Map has synchronized accessible incident/facility list.
- Icon-only controls need accessible names.

## Emergency forms

Preserve values on validation failure. Explain why location permission matters. Distinguish incident location from reporter device location. Never claim submission before server success. Critical actions require deliberate confirmation and final feedback.

## Motion and testing

Respect `prefers-reduced-motion`. Test keyboard-only, VoiceOver/NVDA, axe or equivalent, 200% zoom, high contrast, reduced motion, touch targets and mobile screen readers. Manually review map and alert announcement behavior.
