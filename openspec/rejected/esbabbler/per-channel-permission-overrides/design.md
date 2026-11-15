# Per-Channel Permission Overrides

Discord-style permission overrides scoped to an individual channel, layered on top of room roles.

## Why not

Rooms are flat, with no sub-channels to scope an override to. A room's permission model is one flat scope over a fixed vocabulary, so a permission check stays one aggregate ([RBAC](../../../specs/esbabbler/rbac/design.md)). Reopened when sub-channels, or channel-like sub-spaces within a room, are introduced.
