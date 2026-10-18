# Dashboard grid as a headless package

## Why

The dashboard grid holds two layers. One is the dashboard's look. The other is logic any grid library would want: where an item lands, how the others move aside, and how a press becomes a drag or a resize. That second layer is what `grid-layout-plus` was, and other projects install that package for it. Kept inside the app, it serves one dashboard.

The audit's feature rows show the cost of that. Twelve requested features were set aside because no dashboard asks for them, yet a grid package owes them: resizing from any edge, padding around the grid, compacting sideways or not at all, items sized to their content, swapping on drop, dropping in from outside or from another grid, and grids nested inside tiles.

## What Changes

- **A new published package, `vue-grid-layout-headless`, with no styling.**
  - Its `/placement` subpath holds the placement functions, framework-free and generic over any item with a position and a size.
  - Its main entry holds `useGridLayout`, the gesture state the dashboard's component holds today.
- **The dashboard's grid component keeps only its look:** the tiles, the handles and the placeholder, in the app's tokens.
- **The twelve features are built,** each with its test.
- **Records:** the package's capability holds its requirements, its area README the Upstream table, and the dashboard grid's page keeps only how the dashboard uses the package.

## Capabilities

- **vue-grid-layout-headless/grid-layout** (new). The dashboard's own grid changes nothing a reader sees.

## Waiting on

None.

## Impact

- A new `vue-grid-layout-headless` package, which the app takes as a workspace dependency.
- `apps/web/app/components/Dashboard/Grid.vue`, its test, `apps/web/app/services/dashboard/grid/` and the grid models under `apps/web/app/models/dashboard/`, all of which move into the package.
- `openspec/specs/resource/dashboard-grid/design.md` and the new area README.
