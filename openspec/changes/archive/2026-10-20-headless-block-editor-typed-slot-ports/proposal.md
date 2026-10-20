# Typed slot ports

## Why

The headless block editor types a document from its registry, but three places in its typed path still assert: the builder that turns a registry into a node schema returns its union by assertion, the cache that holds that schema reads it back by assertion, and the read of a node's slot children asserts the list. Each is a place where TypeScript could prove the type and a person has to vouch for it instead.

The project's bar for "perfect" is that a typed path cannot be improved in TypeScript. By that bar the three assertions are defects, and the fix is structural rather than a better comment.

## What Changes

- Each consumer declares its node schema statically, one schema per node type and one union over them, each satisfying its node interface. The runtime builder that assembled the union from definitions is removed, and with it its assertion and the cache that held its result.
- Each consumer owns one exhaustive children port: a function from a node to its slots' child lists, switched on the node's type tag so TypeScript proves every type is covered. The core's walks take the port as a parameter, so the core never correlates a runtime type tag with a props type, and the slot read assertion goes.
- The core's document schema is built from the consumer's node schema and root props schema, passed in typed.
- Internal JSON Pointers are built only by a helper keyed by the slot names, so a misspelt slot fails the typecheck. Pointers that arrive from a client or an agent remain strings, and the parse at the document boundary is where they become typed.
- The registry keeps its runtime slot lists, because the services that move and paste nodes need them as strings. A test per consumer holds those lists to the node types the consumer's static schema accepts.

Nothing an editor sees changes. The stored document shape and every refusal the schema gives stay as they are.

## Capabilities

- **headless-block-editor/editor-core** (modified): a node's children are read through the consumer's port, the document schema takes the consumer's typed node schema, and no typed path asserts.

## Waiting on

- Nothing. It rests on the typed core already on origin and on the webpage's typed node definitions. The email side follows the same port once the webpage side passes.

## Impact

- `packages/headless-block-editor`: the builder, its cache, the slot-read assertion and the runtime branch builder are removed. The walks and the document schema take the port and the typed node schema.
- `apps/web/shared/services/pageBuilder`: a children port module and a static node schema per webpage type.
- `packages/mjml-blocks` and `apps/web/shared/services/pageBuilder/email`: the same port and static schemas for the email types.
- The editor-core and document-model design pages are rewritten as built when this change archives.
