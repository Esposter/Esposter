# Slot-keyed children port

## Why

The typed slot ports change archived the editor's assertions, but its children port still returns a string-keyed record. A consumer's port for a Section returns `Readonly<Record<string, readonly TNode[]>>`, so reading a slot the Section does not have, such as a gallery, compiles with the type of a child list and yields nothing at runtime. The archived design says the core's walks never look a slot up by a runtime string and trust the result; the type does not enforce that, and a consumer's walk can still do it.

## What Changes

- The children port's return type names each node type's own slots, so a read of a slot the node does not have fails the typecheck.
- The core's walks, which iterate a node's slots by the names the registry holds at runtime, read those names through one typed view of the slots rather than through the port's string index.

Nothing an editor sees changes. The stored document shape and every refusal the schema gives stay as they are.

## Waiting on

- A decision on the shape of the port's return type. The core's walks iterate slots by registry name, which is why the record is string-keyed; the change must either keep one string-keyed view for those walks beside a per-type return, or move the walks onto the registry's typed slot names. Choosing between them is the design call this proposal records.

## Impact

- `packages/headless-block-editor`: the port's type and the walks that read children through it.
- `apps/web/shared/services/pageBuilder` and `packages/mjml-blocks`: each consumer's port, whose returns must still satisfy the narrower type.
