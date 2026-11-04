# Tasks

## Grid package (vue-grid-layout-headless/grid-layout)

- [x] Remove the cross-grid move and the nested-grid press. Test first: the removed scenarios are deleted from `useGridLayout.test.ts`, and a palette drop still lands (seen red until the code follows).
- [x] Add the keyboard step. Test first: `stepItem` commits a free step once, refuses an overlapping step under prevent and clamps at the grid's edge; each is seen failing before `stepItem` exists.
- [x] Add the drop preview of an item dragged in from outside, its refused flag under prevent, and the first-free-cell placement. Test first, each seen failing before its code.

## Dashboard grid (resource/dashboard-grid)

- [x] Layout settings and the auto-height flag in the content schema, with defaults. Test first: a stored dashboard without the settings parses to pack upward and push, and a visual without the flag to off, in `shared/models/dashboard/data/Dashboard.test.ts`.
- [x] Eight-handle resize, the keyboard step and the palette drop in the editor grid, each scenario a test in `Grid/Index.test.ts` and `Grid/Tile.test.ts`, written first and seen failing.
- [x] The palette panel and its press-to-add, in `Palette/Tile.test.ts`, written first.
- [x] The Layout control, in `Editor/Layout.test.ts`, written first; its choices save and revert on a refused save.
- [x] The visual's one menu, in `Visual/Preview/ActionsMenu.test.ts`, written first; delete still asks.
- [x] The published view takes the saved packing and shows no editing control, in `Dashboard/Index.test.ts`.
