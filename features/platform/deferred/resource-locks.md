# Resource locks

Azure lock parity: a `CanNotDelete` / `ReadOnly` marker on a resource that the factory enforces on delete/save.

## Why deferred

Single-owner resources today — the type-the-name delete confirmation ([specs/resource-page-parity.md](../specs/resource-page-parity.md)) and the recycle bin ([specs/recycle-bin.md](../specs/recycle-bin.md)) already cover accidental destruction, which is the entire threat model locks address without collaborators.

## Revisit when

Collaboration ships ([document-collaboration](document-collaboration.md)) — protecting a resource from _other_ editors is when locks earn a column.
