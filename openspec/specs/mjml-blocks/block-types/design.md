# Block types

The package's block types as built. The requirements are in [the spec](spec.md), and the mechanism that carries them, with the decisions behind it, is on the [package area](../README.md). This page holds the decisions the block types settle and names the files each part of the behaviour lives in.

## Decisions

- **A component's attributes are one table, and its props schema spreads that table's shape.** A component module exports its attribute table, each attribute's MJML grammar string keyed by the attribute's name, and its props schema: a strict object spreading `createMjmlAttributeShape(table)`, with the component's own non-attribute keys (`content`, `decorative`, its slots) beside them. The helper maps the table to one optional `createMjmlAttributeSchema` per key, typed by the table's own keys, so each attribute's name survives into the schema's type. Its values are all one `MjmlAttributeSchema`, so the helper gives no finer per-key value type than a written-out key would. The names are held by the parse round trip in `parseMjmlDocument`, which refuses a missing or stray key on any component, so a key added to one table or schema and not the other fails there; the type check cannot see a stray key, which is the zod skill's field-key page's point.
- **A node's definition is paired with its own type.** `MjmlNodeDefinition<TNode>` distributes over the node union, so a definition of one type carries that type's props schema and no other. `models/MjmlNodeDefinition.test-d.ts` holds both halves: a button's definition is its own type's, and a button definition given the text props schema is a `@ts-expect-error`.
- **Rich text is the package's own structural type.** `MjmlRichText` is the tree the text components read: nodes with a type, attributes, marks and text. The package defines it rather than importing a type from the app, so the package stays generic over the consumer's content type and imports nothing from the app. A consumer's `MjmlRichTextDefinition<TContent>` parses its HTML into a content type that extends that tree and renders it back to HTML.
- **A head component takes no attributes of its own, and a stray one is refused under its name.** `mj-head` and `mj-attributes` take no attributes, so one they carry is refused under its own name, and a title with an attribute is refused the same way. A second defaults element for one tag is refused under that tag's name, and the first is kept.
- **A style is modelled only as inline.** `mj-style` takes the `inline` attribute set to `inline`, and nothing else. A style carrying any other attribute is refused under `<mj-style>`, and the render writes `inline="inline"` back only for an inline style.
- **A source attribute cannot overwrite a prop the node writes.** An attribute named after one of the node's slots, or after its `content` or its `decorative` flag where the node writes those, is kept under `<name>`. The strict props schema refuses that key as unknown, so the prop the node writes is never overwritten.
- **An image's alternative text is required, or the image is decorative.** `checkMjmlAlternativeText` refuses an image-like node that has neither at its `alt`, the clause "Content is safe before it reaches MJML" states in the spec.
- **A navbar's default icons are the characters they name.** `ico-open` defaults to `☰` and `ico-close` to `⊗`, the characters MJML's entities `&#9776;` and `&#8855;` decode to. The render escapes each attribute value once, so an entity default would reach MJML escaped twice.
- **A unit's numeric grammar is MJML's, except that a comma is refused.** MJML's validator takes a comma as a digit, so `1,5px` passes it, but CSS reads that as no length. The attribute schema drops the comma from the numeric pattern, and every other form of MJML's grammar is kept as its validator matches it.

## Key files

| File                                                             | Role                                                                                                                 |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `packages/mjml-blocks/src/services/components/`                  | one module per MJML component: its attribute table, its props schema, its defaults, its children and its content     |
| `packages/mjml-blocks/src/services/components/mjNavbar.ts`       | the navbar, its attribute table and its default icons                                                                |
| `packages/mjml-blocks/src/services/constants.ts`                 | MJML's component set, the body's children, the head's attribute maps and the colour names it accepts                 |
| `packages/mjml-blocks/src/services/createMjmlRegistry.ts`        | the registry: each component as a block type, with the consumer's leaf types and rich text beside them               |
| `packages/mjml-blocks/src/services/createMjmlAttributeSchema.ts` | one attribute's schema, built from its grammar string                                                                |
| `packages/mjml-blocks/src/services/createMjmlAttributeShape.ts`  | the attribute part of a props schema: each key of a table as an optional attribute schema, typed by the table's keys |
| `packages/mjml-blocks/src/services/getMjmlAttributeFields.ts`    | the editor's field descriptors for a type, read from its attribute table                                             |
| `packages/mjml-blocks/src/services/createMjmlNodeBranch.ts`      | a node's branch of the node union: its type tag, its props and its slots                                             |
| `packages/mjml-blocks/src/services/createMjmlSlotSchema.ts`      | a slot's accepted types as one discriminated union, refusing a child of another type by naming the types it accepts  |
| `packages/mjml-blocks/src/services/mjmlNodeSchema.ts`            | the static node schema: one branch per built-in type, with the consumer's leaf schema beside them                    |
| `packages/mjml-blocks/src/services/mjmlNodeChildren.ts`          | MJML's built-in children port, one exhaustive switch over its node types                                             |
| `packages/mjml-blocks/src/models/MjmlNodeDefinition.ts`          | the per-type definition union, each type paired with its own props schema                                            |
| `packages/mjml-blocks/src/models/MjmlRichText.ts`                | the package's structural rich text type                                                                              |
| `packages/mjml-blocks/src/services/createMjmlRootPropsSchema.ts` | the root's props, with each per-type attribute map checked against the type it names                                 |
| `packages/mjml-blocks/src/services/renderMjmlDocument.ts`        | the render to MJML's JSON form, with the head written from the root's props                                          |
| `packages/mjml-blocks/src/services/serializeMjml.ts`             | the MJML source for the export                                                                                       |
| `packages/mjml-blocks/src/services/parseMjmlDocument.ts`         | the read back, ending in the document schema that gives every refusal                                                |
| `packages/mjml-blocks/src/services/readMjmlNode.ts`              | a tag as a node, with a source attribute that names a prop the node writes kept under its refusal key                |
| `packages/mjml-blocks/src/services/readMjmlNodes.ts`             | each element a node, and each stray text a node that no registry holds                                               |
| `packages/mjml-blocks/src/services/readMjmlHead.ts`              | the head's components as the root's props, refusing the attributes the head and its defaults take                    |
| `packages/mjml-blocks/src/services/readMjmlContent.ts`           | a content-kind tag's raw content, read by its kind                                                                   |
| `packages/mjml-blocks/src/services/MjmlContentKindSchemaMap.ts`  | the one kind-to-schema map: the label's and the raw's content schema, which a component takes rather than declares   |
| `packages/mjml-blocks/src/services/getMjmlRefusalKey.ts`         | the key a refused tag or attribute is kept under: its name in angle brackets                                         |
| `packages/mjml-blocks/src/services/checkMjmlAlternativeText.ts`  | the alternative text rule an image-like node runs over its alt and decorative flag                                   |
| `packages/mjml-blocks/src/services/escapeMjmlAttributes.ts`      | each attribute value escaped once, as the render writes it                                                           |
