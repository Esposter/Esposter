# Esbabbler v4 — Next Feature Batch: Implementation Context

This document provides file paths, patterns, and implementation details for the remaining v4 features. Use as context for a fresh Claude session.

---

## Monorepo Essentials

- **Package manager**: `pnpm` always, never `npm`/`npx`
- **DB schema** (`packages/db-schema`): TypeScript source → compile with `pnpm build` after any schema/enum changes. App imports from `dist/`, not `src/`.
- **DB migrations**: `pnpm db:gen && pnpm db:up` from `packages/db-schema/`
- **Typecheck**: `pnpm typecheck` from `packages/app/`
- **Tests (Windows)**: Do not run — known UnoCSS crash. Write tests; user runs.
- **No `npx`** — always `pnpm exec` or direct `pnpm run` scripts.

## Key Conventions (abridged)

- All boolean variables/functions: `is*` prefix. Never `can*`/`should*` for booleans.
- Pinia stores: full descriptive name `const roomStore = useRoomStore()`, never `const store = useStore()`.
- Store-to-store refs: dot access only (`otherStore.someRef`), never `storeToRefs` inside a store.
- Variable names: never abbreviate. `const updatedDraftRoomIds` not `const next`.
- `satisfies Record<EnumType, ...>` maps — TypeScript errors cascade when new enum values are added; must fix all maps.
- `exhaustiveGuard(input)` in switch defaults — forces all enum cases to be handled.
- Error: always `InvalidOperationError(operation, name, message)` from `@esposter/shared`, never `new Error()`.
- Files: one export per file. Models in `models/`, pure functions in `services/`, constants in `constants.ts`. Never `app/utils/`.
- No px in CSS — always rem.

---

## Feature 1: System Messages for Join / Leave

### What

Post a compact system message when a user joins or leaves a room. Uses existing `createMessage` + `messageEventEmitter` — no new Azure Table.

### Schema changes

**`packages/db-schema/src/models/message/MessageType.ts`**

Current values: `EditRoom`, `Message`, `PinMessage`, `Poll`, `VoiceCall`, `Webhook`

Add:

```ts
JoinRoom = "JoinRoom",
LeaveRoom = "LeaveRoom",
```

Both should **not** be in `StandardMessageType` (they are system messages, not user-authored). Check how `PinMessage` is excluded if it is — replicate that pattern.

After editing, run `pnpm build` in `packages/db-schema/` before typechecking the app.

### Server

**`packages/app/server/trpc/routers/room/index.ts`**

- `createMembers` mutation (uses `getPermissionsProcedure(RoomPermission.ManageRoom)`) → after inserting members, call `createMessage` (the service function, not the tRPC procedure) for each new member with `type: MessageType.JoinRoom` and a display-name message.
- `deleteMember` mutation (uses `getPermissionsProcedure(RoomPermission.KickMembers)`) → after deleting, post `type: MessageType.LeaveRoom`.

Look at how `PinMessage` system messages are created (search for `MessageType.PinMessage` in `server/`) for the exact `createMessage` call pattern.

### Client

**`packages/app/app/components/Message/Content/` — new component**

Create `packages/app/app/components/Message/Content/SystemMessage.vue` (or find the existing PinMessage component for reference). Render compact italic/dimmed row: `"{displayName} joined the room"` / `"{displayName} left the room"`.

Find where messages are rendered by `MessageType` (likely a component map or switch in `Message/Content/`) and add `JoinRoom`/`LeaveRoom` entries.

---

## Feature 2: Slowmode

### What

Per-room send-rate limit. Users can only send once every N seconds. Moderators with `ManageMessages` bypass.

### Schema changes

**`packages/db-schema/src/schema/roomsInMessage.ts`**

Add:

```ts
slowmodeMs: integer("slowmodeMs"),
```

(nullable integer milliseconds — `null` = no slowmode)

**`packages/db-schema/src/schema/usersToRoomsInMessage.ts`**

Add:

```ts
lastMessageAt: timestamp("lastMessageAt"),
```

(nullable timestamp — `null` = never sent)

Run `pnpm db:gen && pnpm db:up` after adding.

### UpdateRoomInput

**`packages/app/shared/models/db/room/UpdateRoomInput.ts`**

Add `slowmodeMs` to the pick + partial, same as `topic`.

### Server: createMessage guard

**`packages/app/server/trpc/routers/message/index.ts`**

After `assertNotReadOnly`, add a slowmode check (similar to `assertNotTimedOut` pattern):

```ts
// packages/app/server/services/message/moderation/assertNotInSlowmode.ts (new file)
export const assertNotInSlowmode = async (db: Context["db"], userId: string, roomId: string) => {
  const room = await db.query.roomsInMessage.findFirst({
    columns: { slowmodeMs: true },
    where: { id: { eq: roomId } },
  });
  if (!room?.slowmodeMs) return;
  const canBypass = await hasPermission(db, userId, roomId, RoomPermission.ManageMessages);
  if (canBypass) return;
  const member = await db.query.usersToRoomsInMessage.findFirst({
    columns: { lastMessageAt: true },
    where: { roomId: { eq: roomId }, userId: { eq: userId } },
  });
  if (member?.lastMessageAt) {
    const elapsedMs = Date.now() - member.lastMessageAt.getTime();
    if (elapsedMs < room.slowmodeMs) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
  }
};
```

After successful send, update `lastMessageAt` on `usersToRoomsInMessage`.

### Room settings UI

**`packages/app/app/components/Message/Model/Room/Settings/Type/Overview/SlowmodeField.vue`** (new)

- `defineModel<number | null>()`, `v-text-field` (type=number, min=0), hint "Milliseconds between messages. Leave empty to disable."
- Emit save on blur/enter.

Add to `packages/app/app/components/Message/Model/Room/Settings/Type/Overview/Index.vue` with diff check in `isChanged` computed.

### Composer feedback

When `createMessage` throws `TOO_MANY_REQUESTS`, show a countdown in the composer. The error can be caught in `packages/app/app/store/message/data.ts` `sendMessage` and surfaced via a snackbar or inline banner.

---

## Feature 3: Thread View

### What

"View Thread" action on any message → right-side panel showing root message + replies.

### Server

**New query** in `packages/app/server/trpc/routers/message/index.ts`:

```ts
readThread: getMemberProcedure(readThreadInputSchema, "roomId").query(async ({ input: { roomId, rootRowKey } }) => {
  const messageClient = await useTableClient(AzureTable.Messages);
  // filter by partitionKey = roomId AND (rowKey = rootRowKey OR replyRowKey = rootRowKey)
  // use existing getTopNEntitiesByType pattern
});
```

**`packages/app/shared/models/db/message/ReadThreadInput.ts`** (new):

```ts
export const readThreadInputSchema = z.object({ roomId: z.string(), rootRowKey: z.string() });
```

### Client

**`packages/app/app/components/Message/Thread/Panel.vue`** (new) — right-side overlay panel, shows messages filtered to the thread.

**`packages/app/app/store/message/thread.ts`** (new) — Pinia store tracking `activeThreadRootRowKey: string | null`.

Action button in message context menu: visible when `message.replyRowKey` exists or the message has replies. Opens thread panel.

Find where message context menus are rendered (likely `Message/Content/ContextMenu.vue` or similar) and add the "View Thread" action.

---

## Feature 4: Starred / Bookmarked Messages

### What

Users can bookmark messages. "Saved Messages" view in sidebar shows all bookmarks across rooms.

### Azure Table

New table: `AzureTable.Bookmarks` (add to the `AzureTable` enum, likely in `packages/db-schema` or `packages/app/shared/models/azure/AzureTable.ts`).

Entity structure:

- `partitionKey = userId`
- `rowKey = ${roomId}|${messageRowKey}` — enables filtering all bookmarks for a user (`partitionKey = userId`) while still encoding the source room+message.

**New entity file**: `packages/app/shared/models/db/message/BookmarkEntity.ts` — extends base Azure Table entity pattern (look at `MessageEmojiMetadataEntity` for reference).

### Server router

**`packages/app/server/trpc/routers/message/bookmark.ts`** (new):

- `createBookmark: getAuthenticatedProcedure(createBookmarkInputSchema).mutation(...)`
- `deleteBookmark: getAuthenticatedProcedure(deleteBookmarkInputSchema).mutation(...)`
- `readBookmarks: getAuthenticatedProcedure(readBookmarksInputSchema).query(...)` — cursor-paginated, all rooms

Wire into `packages/app/server/trpc/routers/message/index.ts` as a sub-router.

### Client

- Bookmark toggle button in message context menu (heart/bookmark icon).
- New "Saved Messages" entry in the left sidebar (look at how the existing sidebar items are defined — likely in a nav config).
- `packages/app/app/store/message/bookmark.ts` (new Pinia store tracking bookmarked message entities).

---

## Feature 5: Softban

### What

Kick a user + mark their last N messages as deleted. Behind `BanMembers` permission.

### Schema

**`packages/db-schema/src/models/message/AdminActionType.ts`**

Add `SoftBan = "SoftBan"`.

### Input schema

**`packages/app/shared/models/db/moderation/ExecuteAdminActionInput.ts`**

Add a new arm to the discriminated union:

```ts
z.object({
  ...baseExecuteAdminActionInputSchema.shape,
  maxDeleteCount: z.number().int().min(1).max(500).default(100).optional(),
  type: z.literal(AdminActionType.SoftBan),
}),
```

### Server

**`packages/app/server/services/message/moderation/AdminActionPermissionMap.ts`**
→ Add `[AdminActionType.SoftBan]: RoomPermission.BanMembers`

**`packages/app/server/trpc/routers/message/moderation.ts`**
→ Add `case AdminActionType.SoftBan:` that:

1. Kicks the user (deletes from `usersToRooms`)
2. Lists their recent N messages from Azure Table (`partitionKey = roomId`, `userId = targetUserId`)
3. Marks each as `deletedAt = now()` via Azure Table update

### Client maps (must all be updated — TypeScript will error)

- `AdminActionIconMap.ts` → `[AdminActionType.SoftBan]: "mdi-account-cancel"`
- `AdminActionColorMap.ts` → `[AdminActionType.SoftBan]: "error"`
- `AdminActionHookMap.ts` → `[AdminActionType.SoftBan]: []`
- `useAdminActionMap.ts` → add empty handler (action is server-side)

### Member ListItem

**`packages/app/app/components/Message/Model/Member/ListItem.vue`**

Add softban button alongside the existing ban button, gated on `BanMembers` permission. Pattern is identical to Timeout/Warn buttons already there.

---

## Feature 6: Basic Word Filter

### What

Per-room blocked-words list. `createMessage` rejects `FORBIDDEN` if message contains any blocked word (case-insensitive). Moderators with `ManageMessages` bypass.

### Schema

**`packages/db-schema/src/schema/`** — new file `roomFiltersInMessage.ts`:

```ts
export const roomFiltersInMessage = pgTable("roomFiltersInMessage", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("roomId")
    .notNull()
    .references(() => roomsInMessage.id, { onDelete: "cascade" }),
  words: text("words").array().notNull().default([]),
});
```

Run `pnpm db:gen && pnpm db:up`.

### Server: createMessage guard

**`packages/app/server/services/message/moderation/assertNotWordFiltered.ts`** (new):

```ts
export const assertNotWordFiltered = async (db, userId, roomId, messageText) => {
  const filter = await db.query.roomFiltersInMessage.findFirst({ where: { roomId: { eq: roomId } } });
  if (!filter?.words.length) return;
  const canBypass = await hasPermission(db, userId, roomId, RoomPermission.ManageMessages);
  if (canBypass) return;
  const lower = messageText.toLowerCase();
  if (filter.words.some((w) => lower.includes(w.toLowerCase())))
    throw new TRPCError({ code: "FORBIDDEN", message: "Message contains blocked content." });
};
```

Add call in `createMessage` after `assertNotReadOnly` / `assertNotInSlowmode`.

### Settings UI

New section in room settings (or new settings type): word list editor. `v-combobox` or `v-chip-group` with input, saves immediately on add/remove.

New tRPC mutations: `updateRoomFilter(roomId, words[])` → upsert on `roomFiltersInMessage`.

---

## Feature 7: /remind [duration] [text]

### What

Client-side reminder. Schedules a `setTimeout`. On fire, calls `createMessage` with `"⏰ Reminder: {text}"`. No server-side persistence.

### SlashCommandType

**`packages/app/app/models/message/slashCommands/SlashCommandType.ts`**

Add `Remind = "Remind"`.

### Definition map

**`packages/app/app/services/message/slashCommands/SlashCommandDefinitionMap.ts`**

```ts
[SlashCommandType.Remind]: {
  description: "Set a reminder. Duration: 5m, 1h, etc.",
  icon: "mdi-alarm",
  parameters: [
    { description: "Duration (e.g. 5m, 1h, 30s)", isRequired: true, name: "duration" },
    { description: "Reminder text", isRequired: true, name: "text" },
  ],
  title: "Remind",
  type: SlashCommandType.Remind,
},
```

### Execute slash command

**`packages/app/app/composables/message/slashCommand/useExecuteSlashCommand.ts`**

```ts
case SlashCommandType.Remind: {
  const { duration, text } = command.parameterValues;
  const ms = parseDuration(duration); // e.g. "5m" → 300000
  if (!ms) break;
  setTimeout(() => {
    createMessage({ message: `⏰ Reminder: ${text}`, roomId, type: MessageType.Message });
  }, ms);
  break;
}
```

Create `packages/app/app/services/message/slashCommands/parseDuration.ts` — parses `"5m"`, `"1h"`, `"30s"` to milliseconds.

---

## Feature 8: Azure Table Batch Reads (readMessagesByRowKeys)

### What

`readMessagesByRowKeys` currently issues one clause per `rowKey` joined with OR. Optimize to use `listEntities` with a single OData filter string (already done via `serializeClauses` — the issue is that it still generates N OR conditions which Azure Table evaluates sequentially). The real win is if Azure Table supports batching via transaction reads — but their REST API batches only apply to mutations. Verify if the current `serializeClauses` already produces a single round-trip; if so, the optimization may already be in place.

**Check first**: Read `packages/app/server/trpc/routers/message/index.ts` `readMessagesByRowKeys` and the `getTopNEntitiesByType` + `serializeClauses` implementations. If `serializeClauses` produces a single OData `$filter` with OR clauses sent in one HTTP request to Azure Table, this is already O(1) round-trips. If `getEntity` is called per-row, that's the optimization target.

**Location to check**: `packages/app/server/composables/azure/table/` for the `getTopNEntitiesByType` and `listEntities` implementations.

---

## Quick Reference: Existing Infrastructure

| Concept                        | Location                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `MessageType` enum             | `packages/db-schema/src/models/message/MessageType.ts`                            |
| `AdminActionType` enum         | `packages/db-schema/src/models/message/AdminActionType.ts`                        |
| `SlashCommandType` enum        | `packages/app/app/models/message/slashCommands/SlashCommandType.ts`               |
| `useExecuteSlashCommand`       | `packages/app/app/composables/message/slashCommand/useExecuteSlashCommand.ts`     |
| `createMessage` router         | `packages/app/server/trpc/routers/message/index.ts`                               |
| `createMembers`/`deleteMember` | `packages/app/server/trpc/routers/room/index.ts`                                  |
| `assertNotReadOnly` (pattern)  | `packages/app/server/services/message/moderation/assertNotReadOnly.ts`            |
| `assertNotTimedOut` (pattern)  | `packages/app/server/services/message/moderation/assertNotTimedOut.ts`            |
| `AdminActionPermissionMap`     | `packages/app/server/services/message/moderation/AdminActionPermissionMap.ts`     |
| moderation router              | `packages/app/server/trpc/routers/message/moderation.ts`                          |
| `AdminActionIconMap`           | `packages/app/app/services/message/moderation/AdminActionIconMap.ts`              |
| `AdminActionColorMap`          | `packages/app/app/services/message/moderation/AdminActionColorMap.ts`             |
| `AdminActionHookMap`           | `packages/app/app/services/message/moderation/AdminActionHookMap.ts`              |
| `useAdminActionMap`            | `packages/app/app/composables/message/moderation/useAdminActionMap.ts`            |
| Member ListItem                | `packages/app/app/components/Message/Model/Member/ListItem.vue`                   |
| Room settings Overview         | `packages/app/app/components/Message/Model/Room/Settings/Type/Overview/Index.vue` |
| `roomsInMessage` schema        | `packages/db-schema/src/schema/roomsInMessage.ts`                                 |
| `usersToRoomsInMessage` schema | `packages/db-schema/src/schema/usersToRoomsInMessage.ts`                          |
| `UpdateRoomInput`              | `packages/app/shared/models/db/room/UpdateRoomInput.ts`                           |
| `AzureTable` enum              | `packages/app/shared/models/azure/AzureTable.ts` (verify path)                    |
| Azure Table entity pattern     | `packages/app/shared/models/db/message/metadata/MessageEmojiMetadataEntity.ts`    |

## Implementation Order (recommended)

1. **System messages** — MessageType enum + server hooks in room router + rendering component
2. **Slowmode** — schema + guard + settings UI (entirely analogous to read-only)
3. **Word filter** — new Postgres table + guard + settings UI (analogous to slowmode)
4. **Softban** — AdminActionType extension (same pattern as Warn, just done)
5. **Bookmarks** — new Azure Table + router + sidebar view
6. **Thread view** — new query + panel component (most UI complexity)
7. **/remind** — pure client-side, no DB (simplest)
8. **Batch reads** — verify if already O(1), then optimize only if not
