# Per-Channel Permission Overrides

Discord-style permission overrides scoped to an individual channel, layered on top of room roles.

## Why deferred

- Rooms are flat — there are no sub-channels to scope overrides to.
- RBAC is currently room-level, which is sufficient for the current model.

## Revisit when

Sub-channels (or channel-like sub-spaces within a room) are introduced.
