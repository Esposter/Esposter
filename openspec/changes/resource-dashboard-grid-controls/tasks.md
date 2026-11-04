# Tasks

## Grid package (vue-grid-layout-headless/grid-layout)

- [ ] Remove the cross-grid move and the nested-grid press. Test first: the removed scenarios are deleted from `useGridLayout.test.ts`, and a palette drop still lands (seen red until the code follows).
- [ ] Add the keyboard step. Test first: `stepItem` commits a free step once, refuses an overlapping step under prevent and clamps at the grid's edge; each is seen failing before `stepItem` exists.
- [ ] Add the drop preview of an item dragged in from outside, its refused flag under prevent, and the first-free-cell placement. Test first, each seen failing before its code.

## Dashboard grid (resource/dashboard-grid)

- [ ] Layout settings and the auto-height flag in the content schema, with defaults. Test first: a stored dashboard without the settings parses to pack upward and push, and a visual without the flag to off, in `dashboard.test.ts` and `Visual` schema tests.
- [ ] Eight-handle resize, the keyboard step and the palette drop in the editor grid, each scenario a test in `Grid/Index.test.ts` and `Grid/Tile.test.ts`, written first and seen failing.
- [ ] The palette panel and its press-to-add, in `Palette/Index.test.ts`, written first.
- [ ] The Layout control, in `Editor/Layout.test.ts`, written first; its choices save and revert on a refused save.
- [ ] The visual's one menu, in `Visual/Preview/ActionsMenu.test.ts`, written first; delete still asks.
- [ ] The published view takes the saved packing and shows no editing control, in `Index.test.ts`.
