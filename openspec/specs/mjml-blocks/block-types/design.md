# Block types

The package's block types as built. The requirements are in [the spec](spec.md), and the mechanism that carries them, with the decisions behind it, is on the [package area](../README.md). This page names the files each part of the behaviour lives in.

## Key files

| File                                                             | Role                                                                                                 |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `packages/mjml-blocks/src/services/components/`                  | one module per MJML component: its attribute grammar, MJML's defaults, its children and its content  |
| `packages/mjml-blocks/src/services/constants.ts`                 | MJML's component set, the body's children, the head's attribute maps and the colour names it accepts |
| `packages/mjml-blocks/src/services/createMjmlRegistry.ts`        | the registry: each specification as a block type, with the consumer's leaf types beside them         |
| `packages/mjml-blocks/src/services/createMjmlPropsSchema.ts`     | a node's props schema: its id, its children, its content by kind and each attribute's grammar        |
| `packages/mjml-blocks/src/services/createMjmlRootPropsSchema.ts` | the root's props, with each per-type attribute map checked against the type it names                 |
| `packages/mjml-blocks/src/services/resolveMjmlAttribute.ts`      | the attribute cascade: the node, the root for its type, the root for all, then MJML's default        |
| `packages/mjml-blocks/src/services/renderMjmlDocument.ts`        | the render to MJML's JSON form, with the head written from the root's props                          |
| `packages/mjml-blocks/src/services/serializeMjml.ts`             | the MJML source for the export                                                                       |
| `packages/mjml-blocks/src/services/parseMjmlDocument.ts`         | the read back, ending in the document schema that gives every refusal                                |
| `packages/mjml-blocks/src/services/readMjmlNodes.ts`             | each element a node, and each stray text a node that no registry holds                               |
| `packages/mjml-blocks/src/services/readMjmlHead.ts`              | the head's components as the root's props                                                            |
| `packages/mjml-blocks/src/services/readMjmlContent.ts`           | a content-kind tag's raw content, read by its kind                                                   |
| `packages/mjml-blocks/src/services/escapeMjmlAttributes.ts`      | each attribute value escaped once, as the render writes it                                           |
