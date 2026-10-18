## 1. The root

- [ ] 1.1 Make the registry an object holding its root's definition beside its types, generic over the type definition, and read the root's content types and props schema in the document schema. Verify: tests named after the scenarios 'A root holding a type its content does not accept' and 'Root props its schema refuses', written first and seen failing.
- [ ] 1.2 Check a paste's copies with the slot-level schema the document schema shares, against the destination slot's accepted types. Verify: a test named after the scenario 'Pasting a child its root does not accept into a slot that does'.

## 2. The fold

- [ ] 2.1 Fold a document from its leaves up through a consumer's render function. Verify: tests named after the scenarios 'Rendering a nested document' and 'A node whose type the registry lacks'.

## 3. The record

- [ ] 3.1 Rewrite the editor core's design as built and archive this change. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/services/openspec` passes.
