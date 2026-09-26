# ID Field Schemas

Read when a schema has a field holding a room, user or other entity id.

- **Shared ID field schemas** — always use the named ID schemas (`roomIdSchema`, `userIdSchema`, `userIdsSchema` from `@esposter/db-schema`) for object fields matching their canonical name. Whole schema is just an ID field → use it directly (`const onUpdateSchema = roomIdSchema`). Multi-field objects → spread the shape (`z.object({ ...roomIdSchema.shape, ...userIdSchema.shape, otherField: ... })`). Constrained variants → chain from the shape field (`userIds: userIdsSchema.shape.userIds.min(1)`). For differently-named fields (`targetUserId`, `actorUserId`), use `selectUserSchema.shape.id` directly. A `.pick()` projection of the row that **owns** the column keeps that row's own schema — the rule is about fields being assembled into an object, not a reason to split one row's projection into a pick plus a spread.
