## 1. Annotations

- [ ] 1.1 Forms filled through the annotation layer and kept on save. Verify: a test titled "#268 Filling a form and downloading it", written first and seen failing.
- [ ] 1.2 `usePdfAnnotations` with the editor modes and their change events. Verify: tests titled "#68 Switching the editor mode" and "#61 Drawing reports a change", written first.
- [ ] 1.3 Comments listed and added as text annotations. Verify: tests titled "#75 Adding a comment on a page", "#44 Listing a document's comments" and "A document with no comments".
- [ ] 1.4 The `/xfdf` subpath. Verify: tests titled "#69 An XFDF round trip" and "Importing XFDF that is not well formed".
- [ ] 1.5 The edited and watermarked download. Verify: tests titled "#37 A watermarked download" and "An unedited document downloads its original bytes".

## 2. Records

- [ ] 2.1 Write the annotations capability's design as built, and re-judge the Upstream rows this change builds on the package's page. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/workspace/staleNames.test.ts src/workspace/duplicateProse.test.ts src/services/openspec` passes.
