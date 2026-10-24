## 1. Origins

- [ ] 1.1 Keep the editors from requesting any third-party origin. Verify: a browser test whose scenario is 'Opening an editor requests no third-party origin'.
  - Done: an inserted image or video loads the app's own placeholder (`apps/web/public/page-builder/placeholder.svg`) rather than `example.com`, and the email starter loads no picture. Open: the browser test that opens each editor and records its requests.

## 2. Benchmarks

- [ ] 2.1 Commit a benchmark for rendering a 2,000-node document. Verify: a test named after the scenario 'Rendering a large document stays under the budget'.
  - Committed as `apps/web/shared/services/pageBuilder/renderWebpageDocument.bench.ts`, which reports 2,000 nodes at about 3.6 seconds against the spec's 20 milliseconds, so the budget is not met. The cost is per text node: `renderNoteHtml` builds its tiptap schema and, on the server, a happy-dom window, on every call. Left open until the render meets the budget. A probe of tiptap's `generateHTML` on the note kit (a one-paragraph document, 300 calls) measured the schema build at 0.8 milliseconds and the whole call at 2.3 milliseconds, so caching the schema saves about a third. The rest is the DOM window and the serialiser, which tiptap's HTML path needs per call, so the 10-microsecond per-node budget is reached only by a serialiser written for the note kit, or by a changed budget. That choice is open and has not been made.
- [ ] 2.2 Commit a benchmark for applying one edit with its inverse recorded.
  - Committed as `apps/web/shared/services/pageBuilder/applyWebpageEdit.bench.ts`, and the inverse test is `applyWebpageEdit.test.ts`, which passes. The edit takes about 7.1 milliseconds (p99 16) against the spec's 0.5 milliseconds, and the patch alone is 0.009 milliseconds, so the cost is the schema's re-parse of the whole document. Left open until the budget is met. Verify: tests named after the scenarios 'A single edit applies within the budget' and 'An edit's inverse restores the document exactly'.
- [ ] 2.3 Commit a benchmark for compiling the starter email on the server.
  - Committed as `apps/web/server/services/emailEditor/compileEmailDocument.bench.ts`: the compile takes about 36 milliseconds (p99 61) against the spec's 250 milliseconds, so the budget is met. Left open until the test named after the scenario exists; the bench carries the number. Verify: a test named after the scenario 'The starter email compiles within the budget'.

## 3. Browser proof

- [ ] 3.1 Record the performance marks for prop and style edits at 2,000 nodes and for selection changes. Verify: tests named after the scenarios 'An edit shows on the canvas within the budget' and 'Selecting a node outlines it within one frame'.
- [ ] 3.2 Render the starter webpage in the canvas and in the published frame at each width, and compare every node's box within one pixel. Verify: tests named after the scenarios 'The canvas matches the published page within one pixel' and 'A published page's own scripts run under the app's policy'.
- [ ] 3.3 Compare the starter email's canvas with its compiled email at desktop and mobile width. Verify: a test named after the scenario 'The email canvas stays close to the compiled email'.

## 4. Output proof

- [ ] 4.1 Assert each type's output whole across its edge values, and assert the sanitiser's vectors on the raw-HTML types. Verify: tests named after the scenarios 'A type's output matches for every edge value' and 'A hostile markup vector in custom HTML is removed'.

## 5. The record

- [ ] 5.1 Record each target with the bench or test that holds it as built, then archive this change. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/services/openspec` passes.
