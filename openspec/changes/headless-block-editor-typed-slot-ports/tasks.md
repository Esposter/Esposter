## 1. Core

- [ ] 1.1 Add `BlockChildren<TNode>` to the core's models as the port's type. Verify: a type-level check in `models/BlockChildren.test-d.ts` that a port returning a slot's children assigns to `BlockChildren` of the union with no assertion, failing first, then passing.
- [ ] 1.2 Rebuild the fold `renderBlockNodes` and the layer and accepting-slot walks to read children through the port, and remove `getParsedSlotNodes`. Verify: the existing `renderBlockNodes.test.ts` and `getBlockLayerRows.test.ts` pass with the same expectations, and a test named after the scenario 'A renderer reads a child through the port', failing first, then passing.
- [ ] 1.3 Make `createBlockDocumentSchema` take the consumer's typed node schema and root props schema, and refine ids and the node count through the port. Verify: `createBlockDocumentSchema.test.ts` passes with its refusal paths unchanged, and a test named after the scenario 'A document is typed by its consumer's node schema', failing first, then passing.
- [ ] 1.4 Remove `buildBlockNodeSchema.ts`, `createBlockNodeSchema.ts`, `createBlockNodeBranch.ts` and their tests, and any cache. Verify: a grep for `buildBlockNodeSchema`, `createBlockNodeSchema` and `getParsedSlotNodes` in source finds nothing, and `pnpm exec tsc --noEmit` in the package reports zero errors.
- [ ] 1.5 Add the internal pointer helper keyed by the slot names. Verify: a test named after the scenario 'A pointer to a misspelt slot fails the typecheck', as a `@ts-expect-error` in a `.test-d.ts`, failing first, then passing.
- [ ] 1.6 Confirm the core has no assertion in its typed path: `as` and `as unknown as` occur nowhere in `src` outside tests, and the package's oxlint and ESLint are clean. Verify: the grep and both lints, run in the package.

## 2. Webpage

- [ ] 2.1 Write `webpageNodeChildren.ts`: one exhaustive switch over the webpage node type tag, each case returning its slots as typed lists, ending in `exhaustiveGuard`. Verify: a test named after the scenario 'Each webpage node's children come from its own slots', failing first, then passing.
- [ ] 2.2 Write each webpage node's static schema, satisfying its node interface, and `webpageNodeSchema` as the union, satisfying `WebpageNode`, with each slot's accepted union built statically and recursion through `z.lazy` with an explicit annotation. Verify: the existing `webpageDocumentSchema.test.ts` passes, and a test named after the scenario 'A stored webpage parses under the static node schema', failing first, then passing.
- [ ] 2.3 Add the one runtime test that the registry's slot lists equal the static schema's accepted tags for every slot. Verify: a test named after the scenario 'A registry's slot lists match the node schema's accepted types', failing first, then passing.
- [ ] 2.4 Replace the webpage renderer's and canvas's calls to read children with the port. Verify: `renderWebpageDocument.test.ts` and the canvas renderer test pass with unchanged expectations.

## 3. Email

- [ ] 3.1 Write `mjmlNodeChildren.ts` and `mjmlNodeSchema.ts` for the email node types, following tasks 2.1 to 2.3. Verify: the email document schema and parse tests pass, and the registry equality test passes for the email registry.
- [ ] 3.2 Remove the email's runtime builder path so the email document schema is built from the static node schema. Verify: `parseMjmlDocument.test.ts` and `compileEmailDocument.test.ts` pass with unchanged expectations.

## 4. Archive

- [ ] 4.1 Rewrite the editor-core and document-model design pages as built, and archive this change. Verify: `pnpm exec openspec validate headless-block-editor-typed-slot-ports --strict --no-interactive` passes, and `pnpm -C scripts exec vitest run src/services/openspec` passes.
