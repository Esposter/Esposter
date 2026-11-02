# Room Procedure Builders

Read when writing a room-scoped procedure, or choosing which builder a read takes.

The builders in `server/trpc/procedure/room/`:

- `getMemberProcedure(schema, roomIdKey)` — verifies caller is a room member; standard message/room operations.
- `getPermissionsProcedure(permission, schema, roomIdKey, rateLimiterType?)` — verifies caller has a specific `RoomPermission`; most common for moderation/admin.
- `getMemberRoomsProcedure()` — a subscription over several rooms: verifies the caller is a member of every room listed, and hands the body `ctx.memberRoomIds`, the set tracked per event for the stream's lifetime.

`rateLimiterType` defaults to `RateLimiterType.Standard`; pass another only to opt into a different limiter.

**A read takes the builder its data deserves, never the one its caller's UI implies.** Hiding a control or a settings panel from a caller who lacks a permission is presentation — the procedure behind it stays callable by anyone the client reaches. So a read whose data is only shown inside a permission-gated surface takes `getPermissionsProcedure` with **that same permission**, and `getMemberProcedure` is correct only where the data is genuinely the room's to see. Deciding it from the surface is how a `getMemberProcedure` ends up behind a `ManageRoom` panel; the exception, where a management panel reads data members already see elsewhere, is stated at the procedure (`openspec/specs/esbabbler/rbac/design.md`).
