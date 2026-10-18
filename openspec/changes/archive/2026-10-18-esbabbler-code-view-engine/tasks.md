## 1. The view

- [x] 1.1 Write the code attachment's tests first and see them fail against the wrapper: the scenarios 'A dialog closes around a code attachment', 'The attachment is removed' and 'The grammar arrives after the text', the first titled "#78 A dialog closes around a code attachment". Verify: `pnpm test app/components/Message/Model/FileRenderer --run` from `apps/web` reports them failing.
- [x] 1.2 Mount the view in `Code.vue` as the design says, inline `useExtensions`, and remove `vue-codemirror` from the app's manifest, the catalog and the ledger. Verify: the same command passes, and `vue-codemirror` appears nowhere in `apps/web` or `pnpm-lock.yaml`.

## 2. The record

- [x] 2.1 Rewrite the code viewer's design as built, with the Upstream table over every `vue-codemirror` issue, and archive this change. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/workspace/staleNames.test.ts src/services/openspec` passes.
