## 1. The package

- [x] 1.1 Create `vue-grid-layout-headless` by the file-organization skill's new-package recipe. Move the placement functions and their tests into its `/placement` subpath, generic over an item with an id, a position and a size. Verify: tests titled "Compacting upward", "An item wider than the grid" and "Pushing items aside" in the package, and `pnpm test --run` there passing with its bundle size snapshot.
- [ ] 1.2 Move the gesture state out of the dashboard's grid component into `useGridLayout`, and move the gesture tests to the composable's suite. The component renders the composable's tiles, handles and placeholder. Verify: tests titled "A press that barely moves stays a click", "A drag writes its changed cells once", "A cancelled pointer writes nothing" and "A second pointer pressed during a drag", and `pnpm test app/components/Dashboard --run` from `apps/web` passing.

## 2. The features the audit set aside

- [ ] 2.1 Resize from every edge and corner. Verify: tests titled "#38 #51 Resizing from the left edge" and "A resize past the grid's edge".
- [ ] 2.2 Outer padding as its own option, separate from the gap between tiles. Verify: a test titled "#17 #62 Padding the grid apart from its gaps".
- [ ] 2.3 Horizontal compaction and no compaction. Verify: tests titled "#36 Compacting sideways" and "#36 Leaving a dropped item where it lands".
- [ ] 2.4 Items sized to their content, in whole rows. Verify: a test titled "#11 #42 #55 An item grows to hold its content".
- [ ] 2.5 Swap on drop as a collision mode beside push and prevent. Verify: tests titled "#66 Swapping two items on drop", "A swap that lands on several items" and "A move refused under prevent".
- [ ] 2.6 Dropping an item in from outside the grid, a palette or another grid. Verify: tests titled "#6 Dropping a palette entry into the grid", "#21 Moving an item into another grid" and "A drop outside every grid".
- [ ] 2.7 A grid nested in a tile moves its own items. Verify: a test titled "#22 #40 Dragging inside a nested grid".

## 3. The record

- [ ] 3.1 Write the grid layout capability's design as built, and the area's `README.md` holding the Upstream table moved from the dashboard grid's page with the twelve rows judged again. Cut the dashboard grid's page back to the dashboard's use of the package, reword its Decision that says the grid package builds the resize handles as settled (the package is unbuilt, so the sentence is future tense until it ships), and add the area to the repo's package index. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/workspace/staleNames.test.ts src/workspace/duplicateProse.test.ts src/services/openspec` passes.
