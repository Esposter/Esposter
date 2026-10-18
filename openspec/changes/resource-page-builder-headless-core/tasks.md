## 1. The applier

- [ ] 1.1 Move the JSON Patch applier, its models and its helpers from `apps/web/shared` into `packages/shared`, and point every importer at `@esposter/shared`. Verify: `applyPatches.test.ts` passes from its new place, and `pnpm test server/trpc/routers/resource.test.ts --run` from `apps/web` passes.

## 2. The package

- [ ] 2.1 Create the `headless-block-editor` package as the `file-organization` skill's new-package page sets out, with no dependency on Vue or the DOM. Verify: `pnpm build` in the package succeeds and its bundle size snapshot is written.
- [ ] 2.2 Write the tree, the registry contract and the document schema against a test registry of the package's own. Verify: tests named after the scenarios 'A child its slot does not allow' and 'A document from another registry', written first and seen failing.
- [ ] 2.3 Write the commands and their reversal. Verify: tests named after the scenarios 'Reversing a move', 'An edit that cannot apply', 'Moving into a sibling that refuses the node', 'Pasting a node twice' and 'Pasting into another editor'.
- [ ] 2.4 Write the navigation and the history. Verify: tests named after the scenarios 'Removing the last child', 'A new edit after undo' and 'The bound is reached'.
- [ ] 2.5 Run the package's suite in the plain Node environment. Verify: a test named after the scenario 'An agent edits on the server' passes with no DOM environment configured.

## 3. The record

- [ ] 3.1 Write the package's area page as built and archive this change. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/services/openspec` passes.
