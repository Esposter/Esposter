## 1. Placement

- [x] 1.1 Write the placement functions' tests first and see them fail: collision, compaction, a move's push, bounds and fitting to fewer columns, with the scenarios 'Dropping a visual onto another', 'Shrinking a visual to nothing' and 'Opening a dashboard on a phone', titled with #16 and #28 where they reproduce those issues. Verify: `pnpm test app/services/dashboard/grid --run` from `apps/web` reports them failing.
- [x] 1.2 Write the placement functions and the cell geometry. Verify: the same command passes.

## 2. The grid

- [x] 2.1 Build the grid component: tiles and placeholder, the drag and resize over Pointer Events, the preview layout, and the one write at the gesture's end; test 'A short drag is a click', 'Dragging across several cells' (#45) and 'Scrolling a published dashboard on a phone' (#54) first. Verify: `pnpm test app/components/Dashboard --run` from `apps/web` fails, then passes.
- [x] 2.2 Mount it in the editor and the published dashboard, drop `i`, `moved` and the unused per-item fields from the layout item, and remove `grid-layout-plus` from the app's manifest, the catalog and the ledger. Verify: `grid-layout-plus` appears nowhere in `apps/web` or `pnpm-lock.yaml`, and the touched suites pass.

## 3. The record

- [x] 3.1 Write the capability's design as built, with the Upstream table, and archive this change. Before archiving, name the alternative rejected and the reason it lost for the grid-height decision (a grid that scrolls inside its own height is the candidate, lost because the page should scroll) and for the styles decision (the library's runtime-injected CSS is the candidate; the reason it lost is for the author to state), since the design does not record either. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/workspace/staleNames.test.ts src/services/openspec` passes.
