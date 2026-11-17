# Responsive design specification

## Breakpoints

| Width | Behavior |
|---|---|
| ≥1440px | Full EOC 3-zone workspace and persistent nav |
| 1280–1439px | Collapsible EOC queue/inspector |
| 1024–1279px | Two-zone EOC; inspector drawer |
| 768–1023px | Queue/detail tabs; map focused panel |
| 640–767px | Single-column citizen/public, compact filters |
| <640px | Dedicated mobile views; citizen bottom nav; rescue assignment cards |

## Citizen

Desktop map/facilities and report list in columns; tablet map full-width; mobile alert first, prominent report CTA, expandable map, reports/facilities sections, tap-to-call contacts. Don't require map interaction to complete a report.

## EOC/admin

Desktop: 248px nav + 340px queue + flexible map + 380px inspector. Laptop: queue + map, inspector drawer. Tablet: Queue/Map/Selected tabs, escalated queue stays prominent. Mobile: critical queue and focused incident view; map separate full-screen view. Avoid tiny tables and dense filter rows.

## Rescue

Mobile-first assigned incident, large status action, location/details, map sheet. Desktop/tablet map-list split. Self-assign and progress controls ≥48px; no route tracking controls.

## Hospital/shelter

Mobile capacity used/total, status and save first; map secondary. Desktop management left, map right. Hospital uses beds; shelter uses occupants.

## Public/auth/general

Hero stacks at 768px; auth form max-width 460px; registration file picker fits viewport. Touch targets ≥44px, critical ≥48px. Safe-area insets for bottom nav. No horizontal overflow at 320px. Test 200% zoom and long translated strings.
