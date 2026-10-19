## 1. Typed node schema

- [ ] 1.1 Add `createBlockNodeSchema(registry, acceptedTypes)`: a discriminated union on `type` with a strict branch per accepted type, its props built from the type's `propsSchema` shape, a string `id`, and each slot as an array of the same schema over the slot's types, reached through `z.lazy` and cached per accepted-type set; `z.never()` for an empty set. Verify: tests named after the scenarios 'a node of an accepted type parses', 'a node of a type its slot refuses names its type field' and 'a prop the type does not declare is refused by name', failing first, then passing.
- [ ] 1.2 Rebuild `createBlockDocumentSchema` on it: the root's content as the node schema over the root's accepted types, the root's props, and one refinement for ids unique across the parsed tree and the node count within the limit. Verify: the existing `createBlockDocumentSchema.test.ts` scenarios pass, with the refusal paths they assert updated to the type field; and a test named after the scenario 'a repeated id is refused across slots'.
- [ ] 1.3 Rebuild `createBlockNodesSchema` on the same schema, the paste's copies checked as the destination slot's children. Verify: `pasteBlockNodes.test.ts` passes with its expectations unchanged except the refusal paths; and a test named after the scenario 'a pasted child of a type its slot refuses is refused'.
- [ ] 1.4 Delete `checkBlockNodes.ts` and its references; keep `blockNodeShapeSchema` and its readers. Verify: `pnpm -C packages/headless-block-editor exec vitest run` passes, and a grep for `checkBlockNodes` finds no source file.

## 2. Consumers declare what they store

- [ ] 2.1 Declare in each Webpage type's props every key its stored node holds, the style included wherever the style panel stores it, so no existing webpage document is refused. Verify: the webpage document schema tests pass, and a test named after the scenario 'a stored webpage parses under the typed schema' over a fixture holding every type.
- [ ] 2.2 Declare the same in each Email type's props, and merge fields as string props on the node that holds them. Verify: `parseMjmlDocument.test.ts` and `createMjmlRegistry.test.ts` pass, and a test named after the scenario 'a stored email parses under the typed schema'.

## 3. The agent reads the same schema

- [ ] 3.1 Add the conversion test in headless-block-editor: a slot's JSON Schema lists exactly the types the slot accepts, each type's props appear with their fields, and a recursive slot converts with a `$ref`. Verify: tests named after the scenarios 'An agent reads the types a slot accepts' and 'A recursive slot converts without an opaque part', failing first, then passing.
- [ ] 3.2 Rewrite the schema sections of `openspec/specs/headless-block-editor/editor-core/design.md` (the "shape first, then the registry" decision, its Key files rows) and `openspec/specs/resource/page-builder/document-model/design.md` (the Schemas section and its Key files rows) as built when this ships. Verify: `pnpm -C scripts exec vitest run src/services/openspec` passes, and `pnpm exec openspec validate headless-block-editor-typed-documents --strict --no-interactive` passes.
