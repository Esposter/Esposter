# Typed documents

## Why

The architecture program's cutover says the page builder's document is "a typed node tree whose schema the registry builds", so the Webpage and the Email are described all the way down to an agent. At HEAD that is not true. A document's schema checks each node's type, props and slot children in a refinement, and its shape reads every node's props as a loose record. A JSON Schema conversion, which is all an agent reads, therefore shows a node's props as opaque and never shows which types a slot accepts. An agent editing a webpage would be told what a node is called and nothing about what it holds or where it may go, and the content tools would refuse any edit inside a node's props.

The fix is for the schema to be the validator. Each node's type is a branch of a union, and each slot's children are a union over the types that slot accepts. The JSON Schema an agent reads and the check the server runs then come from one source, so they cannot disagree.

## What Changes

- A consumer's document schema types every node by its registry type. Its JSON Schema names each type's props and, for each slot, only the types that slot accepts.
- A node carries no prop its type does not declare, and a document holding one is refused by naming the key.
- The document's ids stay unique and its node count stays within the consumer's limit, checked over the parsed tree.
- A paste's copies are checked by the same typed schema as the destination slot's children.
- Refusals name the node's `type` field at the position the schema reached, and the message lists the types that slot accepts.
- The Webpage and Email registries declare every prop their stored nodes hold, so the typed schema accepts what the editors already store.

Nothing an editor sees changes. The agent content tools, the resource list and the cutover's ResourceDefinitionMap entries are not touched here; the cutover records the Webpage and Email's opaque paths once they are registered.

## Capabilities

- **headless-block-editor/editor-core** (modified): a document is checked by one typed schema, and an agent reads the same schema.
- **resource/page-builder/document-model** (modified): the document schema is built from the registry, and no refinement walks the slots.

## Waiting on

- Nothing. The probe that this change rests on converted a recursive typed registry to JSON Schema with no opaque parts and no unbounded recursion (zod 4.6.7, the repo's version).

## Impact

- `packages/headless-block-editor`: a typed node schema, the document and paste schemas rebuilt on it, the slot walk retired. The loose node reader stays for the readers that read untrusted parts.
- `apps/web/shared/services/pageBuilder`: the Webpage registry's props declare the fields the editors store.
- `packages/mjml-blocks`: the Email registry's props do the same, and its parse keeps its signature.
- `openspec/specs/headless-block-editor/editor-core/design.md` and `openspec/specs/resource/page-builder/document-model/design.md`: the schema sections are rewritten as built when this ships.
