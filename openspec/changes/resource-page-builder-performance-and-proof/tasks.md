## 1. Origins

- [ ] 1.1 Keep the editors from requesting any third-party origin. Verify: a browser test whose scenario is 'Opening an editor requests no third-party origin'.
  - Done: an inserted image or video loads the app's own placeholder (`apps/web/public/page-builder/placeholder.svg`) rather than `example.com`, and the email starter loads no picture. Open: the browser test that opens each editor and records its requests.

## 2. Benchmarks

- [x] 2.1 Commit a benchmark for rendering a 2,000-node document. Verify: a test named after the scenario 'Rendering a large document renders every node'.
  - Committed as `apps/web/shared/services/pageBuilder/renderWebpageDocument.bench.ts`, which reports the render's time (about 3.6 seconds for 2,000 nodes) without asserting it. The test is in `renderWebpageDocument.test.ts`.
- [x] 2.2 Commit a benchmark for applying one edit with its inverse recorded. Verify: tests named after the scenarios 'A single edit changes only the node it names' and 'An edit's inverse restores the document exactly'.
  - Committed as `apps/web/shared/services/pageBuilder/applyWebpageEdit.bench.ts`, which reports the edit's time (about 7.1 milliseconds mean) without asserting it. The tests are in `applyWebpageEdit.test.ts`.
- [x] 2.3 Commit a benchmark for compiling the starter email on the server. Verify: a test named after the scenario 'The starter email compiles under strict validation'.
  - Committed as `apps/web/server/services/emailEditor/compileEmailDocument.bench.ts`, which reports the compile's time (about 36 milliseconds) without asserting it. The test is `starterEmail.test.ts`.

## 3. Browser proof

- [ ] 3.1 Record the performance marks for prop and style edits at 2,000 nodes and for selection changes, reported and not asserted. Verify: tests named after the scenarios 'An edit shows on the canvas' and 'Selecting a node outlines it'.
- [ ] 3.2 Render the starter webpage in the canvas and in the published frame at each width, and compare every node's box within one pixel. Verify: tests named after the scenarios 'The canvas matches the published page within one pixel' and 'A published page's own scripts run under the app's policy'.
- [ ] 3.3 Compare the starter email's canvas with its compiled email at desktop and mobile width. Verify: a test named after the scenario 'The email canvas stays close to the compiled email'.

## 4. Output proof

- [ ] 4.1 Assert each type's output whole across its edge values, and assert the sanitiser's vectors on the raw-HTML types. Verify: tests named after the scenarios 'A type's output matches for every edge value' and 'A hostile markup vector in custom HTML is removed'.

## 5. The record

- [ ] 5.1 Record each target with the bench or test that holds it as built, then archive this change. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/services/openspec` passes.
