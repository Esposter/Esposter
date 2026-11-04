# Dashboard grid controls

## Why

The grid package builds more than the dashboard draws. Its resize handles, palette drops, grow-to-content items, collision and compaction modes and keyboard-free placement all work in the package, but the editor only uses push collisions, vertical compaction and the south-east corner. The owner ruled these spec gaps rather than dead code, so each one is specified and drawn in the editor, with the surface designed so that a control is shown only where it is used.

## What Changes

- A visual resizes from any of its eight edges and corners. Its handles are drawn only on hover or focus, so the cursor and an outline say it can be resized.
- A palette of visual types sits above the grid. Dropping a type on the grid adds that visual where it lands; pressing it adds one at the first free cell, which is also the touch and keyboard path.
- A visual moves and resizes from the keyboard, one cell per key, and each step is saved.
- A table visual can fit its height to its content, which is a per-visual setting saved with the visual.
- The dashboard saves its layout: how visuals pack (upward, sideways or free) and what a drop does on another visual (push, swap or block). The published dashboard packs by the same choice.
- A visual's occasional actions, including fit height and delete, sit in one menu on the visual, so no visual carries a row of buttons.
- A published dashboard shows the visuals and its own export, and none of the editing controls.
- The grid package drops the cross-grid move and the nested-grid press, which nothing draws, and gains the keyboard step, the first-free-cell placement and the drop preview that the editor needs.

## Capabilities

- **resource/dashboard-grid** (changed)
- **vue-grid-layout-headless/grid-layout** (changed)

## Waiting on

None.

## Impact

- `packages/vue-grid-layout-headless` — the gesture, placement and external-drag code, and their tests.
- `apps/web/app/components/Dashboard/**` — the grid, its tile, the palette, the layout control and the visual's menu.
- `apps/web/app/store/dashboard/**` and `apps/web/shared/models/dashboard/data/**` — the layout settings, the auto-height flag and the stored schema.
- `apps/web/server/trpc/routers/dashboard*` — the dashboard router tests, since the content schema gains two settings.
