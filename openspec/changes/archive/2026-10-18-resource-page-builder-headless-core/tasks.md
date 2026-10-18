## 1. The applier

- [x] 1.1 Move the JSON Patch applier, its models and its helpers from `apps/web/shared` into `packages/shared`, and point every importer at `@esposter/shared`. Verify: `applyPatches.test.ts` passes from its new place, and `pnpm test server/trpc/routers/resource.test.ts --run` from `apps/web` passes.
- [x] 1.2 Sweep the prose that names the applier's old location, in the same change as the move: `openspec/specs/architecture/agent-content-tools/design.md` (the applier's sentence and its Key files row), `openspec/changes/architecture-ai-native-resources-program/design.md` (the cutover item's "lives in the app's `shared/` layer"), and the two `x-touches` globs in `openspec/changes/resource-page-builder-program/.openspec.yaml` that name the applier's folders, rewritten to the folders the move lands in, "services/jsonPatch" and "models/jsonPatch" under `packages/shared/src`. Verify: `grep -rn "apps/web/shared/services/jsonPatch" openspec` finds nothing outside this change's own folder.

## 2. The package

- [x] 2.1 Create the `headless-block-editor` package as the `file-organization` skill's new-package page sets out, with no dependency on Vue or the DOM. Verify: `pnpm build` in the package succeeds and its bundle size snapshot is written.
- [x] 2.2 Write the tree, the registry contract and the document schema against a test registry of the package's own. Verify: tests named after the scenarios 'A child its slot does not allow' and 'A document from another registry', written first and seen failing.
- [x] 2.3 Write the commands and their reversal. Verify: tests named after the scenarios 'Reversing a move', 'An edit that cannot apply', 'Moving into a sibling that refuses the node', 'Pasting a node twice' and 'Pasting into another editor'.
- [x] 2.4 Write the navigation and the history. Verify: tests named after the scenarios 'Removing the last child', 'A new edit after undo' and 'The bound is reached'.
- [x] 2.5 Run the package's suite in the plain Node environment. Verify: a test named after the scenario 'An agent edits on the server' passes with no DOM environment configured.

## 3. The record

- [x] 3.1 Write the package's area page as built and archive this change. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/services/openspec` passes.
