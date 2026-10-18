# Resource locks

Azure lock parity: a `CanNotDelete` / `ReadOnly` marker on a resource that the factory enforces on delete/save.

## Why deferred

Single-owner resources today — the [recycle bin](../../../specs/resource/recycle-bin/design.md), with its Restore toast, and the type-the-name guard on its purge already cover accidental destruction, which is the entire threat model locks address without collaborators.

## Revisit when

Collaboration ships ([resource collaboration](../document-collaboration/design.md)) — protecting a resource from _other_ editors is when locks earn a column.
