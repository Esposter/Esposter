---
title: Per-channel permission overrides
description: Deferred — Discord-style channel-scoped permission overrides.
---

# Per-Channel Permission Overrides

Discord-style permission overrides scoped to an individual channel, layered on top of room roles.

**Why deferred**

- Rooms are flat — there are no sub-channels to scope overrides to.
- RBAC is currently room-level, which is sufficient for the current model.

**Revisit when:** sub-channels (or channel-like sub-spaces within a room) are introduced.
