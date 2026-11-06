## 1. Package

- [x] 1.1 Create the package with `pnpm ai:package:new vue-editor-layout-headless --kind library`, with Vue as a peer, and a description from the proposal, then `pnpm i`. Verify: the workspace inventory suites the generator names pass in `scripts`.
- [x] 1.2 Write the models, importing the clamp from VueUse after confirming the export. Verify: the package typechecks, and the test written in task 3.1 imports it.

## 2. Resolving

- [x] 2.1 Resolve a layout against a context. Verify: tests named after 'A panel is present only while its condition holds', 'Content follows the selection kind', 'A kind with no entry and no wildcard shows no panel' and 'An empty region is omitted', each seen failing first.
- [x] 2.2 Present each region for the size class, at its edge for that class, and decide how it opens. Verify: tests named after 'A region's presentation follows the size class', 'A toolbar moves to the bottom when compact', 'A sheet waits for the reader' and 'A docked region opens with its content', seen failing first.
- [x] 2.3 Carry each region's size limits into the resolved region. Verify: a test named after 'A resolved region carries its size limits', seen failing first.

## 3. Reader state

- [x] 3.1 Resize, toggle and set the active panel as pure functions. Verify: tests named after 'A resize stays within the region's limits', 'A resize past a limit is clamped' and 'A resize leaves the given state unchanged', seen failing first.
- [x] 3.2 Parse a stored state against the layout. Verify: tests named after 'A stale id is dropped from a stored state', 'A stored size outside the limits is clamped' and 'A value that is not a state gives the default', seen failing first.

## 4. Composable

- [x] 4.1 Write the layout composable over the functions. Verify: tests named after 'A change of selection re-resolves the layout' and 'A resize is kept in the reader's state', seen failing first.

## 5. Check

- [x] 5.1 Check a layout for gaps. Verify: tests named after 'A selection kind with no content is reported', 'A content key nobody registered is reported', 'A duplicate id is reported' and 'A panel in a region that does not exist is reported', seen failing first.
- [x] 5.2 Hold the bundle's size. Verify: the bundle-size record holds the package's files and passes against a fresh build, and fails when a function from outside the package's own dependencies is imported.
