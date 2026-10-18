# Registry root and render fold

## Why

The editor core was built with one consumer in mind, and the next two do not fit it. MJML's body holds only wrappers, sections, heroes and raw blocks, and a survey's root holds only pages, but the core's root accepts every type. The root's own props — an email's preview text, a webpage's tokens, a survey's title — pass the document schema unchecked. And every consumer that publishes a document walks the tree the same way to render it, which two consumers in two packages would each write again.

## What Changes

- A registry declares its root beside its types: the types the root's content accepts and the schema its props pass, so a document whose root holds a type it does not accept, or props its schema refuses, is refused with the path that refused it.
- A paste checks its copies as the destination slot's children, so a node a slot accepts pastes into it whatever the root accepts.
- The core folds a document from its leaves up, rendering each node once its slots have rendered, into whatever output its consumer's render function returns.

## Capabilities

- **headless-block-editor/editor-core** (modified)

## Waiting on

None.

## Impact

- `packages/headless-block-editor`: the registry model, the document schema, the paste, the new fold and its tests.
- The page builder's document model and MJML blocks changes, which declare their roots and render through the fold.
