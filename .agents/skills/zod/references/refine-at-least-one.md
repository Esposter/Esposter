# At Least One Field

Read when an update or patch schema has optional fields and at least one must be provided.

- **`refineAtLeastOne`** — when an update/patch schema has optional fields and at least one must be provided, use `refineAtLeastOne` from `#shared/services/zod/refineAtLeastOne`. Never inline `.refine((data) => ...)`. **Its key list is read off the schema it guards, never restated as literals**: name the updatable fields once as their own schema and pass `updatableFooSchema.keyof().options`, so a field added to the shape is guarded without a second edit. A literal array is right only where the guarded set is deliberately narrower than the schema's optional fields — `updateUserToRoomInputSchema`, whose optional `targetUserId` is a qualifier rather than one of the fields the update must set.
