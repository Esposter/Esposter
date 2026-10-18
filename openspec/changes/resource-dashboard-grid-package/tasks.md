## 1. The package

- [ ] 1.1 Create `vue-grid-layout-headless` by the file-organization skill's new-package recipe. Move the placement functions and their tests into its `/placement` subpath, generic over an item with an id, a position and a size. Verify: `pnpm test --run` in the package passes, with its bundle size snapshot.
- [ ] 1.2 Move the gesture state out of the dashboard's grid component into `useGridLayout`, and move the gesture tests to the composable's suite. The component renders the composable's tiles, handles and placeholder. Verify: the package suite and `pnpm test app/components/Dashboard --run` from `apps/web` pass.

## 2. The features the audit set aside

- [ ] 2.1 Resize from every edge and corner. Verify: tests titled "#38 …" and "#51 …".
- [ ] 2.2 Padding around the grid apart from the margin between items. Verify: tests titled "#17 …" and "#62 …".
- [ ] 2.3 Horizontal compaction and no compaction. Verify: a test titled "#36 …".
- [ ] 2.4 Items sized to their content, in whole rows. Verify: tests titled "#11 …", "#42 …" and "#55 …".
- [ ] 2.5 Swap on drop as a collision mode beside push and prevent. Verify: a test titled "#66 …".
- [ ] 2.6 Dropping an item in from outside the grid, a palette or another grid. Verify: tests titled "#6 …" and "#21 …".
- [ ] 2.7 A grid nested in a tile moves its own items. Verify: tests titled "#22 …" and "#40 …".

## 3. The record

- [ ] 3.1 Write the package's area README as built, holding its requirements and the Upstream table moved from the dashboard grid's page with the twelve rows judged again. Cut the dashboard grid's page back to the dashboard's use of the package, and add the area to the repo's package index. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/workspace/staleNames.test.ts src/workspace/duplicateProse.test.ts src/services/openspec` passes.
