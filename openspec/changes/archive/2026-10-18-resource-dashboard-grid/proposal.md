# Dashboard grid of the app's own

## Why

The dashboard lays out its visuals with `grid-layout-plus`, which brings `interactjs` and two `@vexip-ui` utility packages for a drag and a resize that Pointer Events do directly, injects its CSS at runtime, and writes a runtime flag of its own into every saved visual. Its reported defects that reach the app include a published dashboard that overlaps its visuals when it narrows to fewer columns, a resize that ignores its lower bound, and Android touch scrolling captured on a dashboard that cannot be edited.

## What Changes

- The dashboard's visuals are placed by a grid component and a placement service of the app's own: vertical compaction, collision push, bounds and the column count per screen width.
- A visual is moved and resized in the editor with Pointer Events, with a placeholder showing where it will land, and its new place is written once when the gesture ends.
- A published dashboard reflows to fewer columns without overlap, and never captures touch scrolling.
- A saved visual holds only its position and size; the library's `i`, `moved` and per-item option fields leave its schema.
- `grid-layout-plus` leaves the catalog and the ledger.

## Capabilities

- **resource/dashboard-grid** (new)

## Waiting on

None.

## Impact

- `apps/web/app/components/Dashboard/Index.vue`, `apps/web/app/components/Dashboard/Editor/Content.vue`, a grid component and placement services beside them.
- `apps/web/shared/models/dashboard/data/LayoutItem.ts` and `apps/web/shared/models/dashboard/data/Visual.ts`.
- The catalog, the lockfile and `.agents/ledgers/dependencies.md`.
