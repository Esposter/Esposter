# Esbabbler — Direct Messages Architecture

Private 1:1 and small-group (≤10 participants) conversations. Reuses message infrastructure via `RoomType.DirectMessage` on the existing rooms table.

## User Experience

- The sidebar gains a **Direct Messages** section below the room list, sorted by most-recent message
- A **"+" button** next to the "Direct Messages" header opens a **New Message** dialog
  - The dialog lists the current user's accepted friends with checkboxes and a name filter
  - Selecting one or more friends and clicking **Create Message** calls `createDirectMessage` and navigates to the DM thread
  - Requires the Friends system — see [`friends.md`](friends.md)
- DM rooms are invisible to non-participants — no public discovery
- Group DMs show a generated name ("You, Alice, Bob") unless the creator sets a custom name
- 1:1 DM names are derived at display time from the other participant's username (never stored, so they stay fresh)
- Hovering a DM row reveals a close button that soft-hides it (`isHidden = true`) without deleting the thread

## Data Model

### Schema change — rooms table

Add a `type` column (default `RoomType.Room` for all existing rows) and a `participantKey` column used exclusively by DM rooms for O(1) idempotency lookups:

```typescript
// packages/db-schema/src/models/room/RoomType.ts
export enum RoomType {
  Room = "Room",
  DirectMessage = "DirectMessage",
}
```

```typescript
// packages/db-schema/src/schema/rooms.ts  (additive changes)
type: text("type").notNull().default(RoomType.Room).$type<RoomType>(),
// Canonical sorted participant fingerprint — set only for DirectMessage rooms.
// Computed as userIds.toSorted().join(ID_SEPARATOR) before insert.
// Unique index enforces one DM room per participant set at the DB level.
participantKey: text("participant_key").unique(),
```

No other schema change is needed. The existing `usersToRooms` join table already models participants for both room types.

### Soft-hide on leave

Add an `isHidden` boolean column to `usersToRooms` (default `false`). When a user leaves or hides a group DM their row stays (so they can be re-added and still receive past messages if re-invited) but the DM is removed from their sidebar.

```typescript
// packages/db-schema/src/schema/usersToRooms.ts  (additive change)
isHidden: boolean("is_hidden").notNull().default(false),
```

## API Changes

New/modified tRPC procedures:

| Procedure             | Location                        | Notes                                                                                                           |
| --------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `createDirectMessage` | `routers/room/directMessage.ts` | Finds or creates a DM room for the given set of `userIds`; idempotent — two users always share the same DM room |
| `listRooms`           | `routers/room/index.ts`         | Add optional `type` filter; client fetches rooms and DMs separately                                             |
| `hideDirectMessage`   | `routers/room/directMessage.ts` | Sets `isHidden = true` on the caller's `usersToRooms` row                                                       |

### Idempotency in `createDirectMessage`

`participantKey = userIds.toSorted().join(ID_SEPARATOR)` → upsert on conflict. O(1) unique-index check; duplicate DM threads prevented at DB level.

### Permissions

DMs inherit existing `usersToRooms` membership checks. Additional constraints in `createDirectMessage`:

- Public join/invite links (`invites` table) are rejected for `RoomType.DirectMessage`
- Room discovery / `listPublicRooms` excludes DMs
- Max 10 participants enforced on `createDirectMessage`

## Notifications

DMs default to notify-on-every-message. In `createMessage`, if `RoomType.DirectMessage` → bypass keyword-rule check, always publish to recipient's Web Push.

## Folder Structure

Changes are additive to the existing room infrastructure — no new top-level folders:

```text
packages/db-schema/src/
  schema/rooms.ts                               # type + participantKey columns (implemented)
  schema/usersToRooms.ts                        # isHidden column (implemented)

packages/app/
  app/
    components/Message/
      LeftSideBar/
        DirectMessages.vue                      # DM sidebar section header + "+" button
      Model/Room/
        DirectMessageList.vue                   # scrollable DM list (implemented)
        DirectMessageListItem.vue               # single DM row with close button (implemented)
        CreateDirectMessageButton.vue           # "+" icon that opens the dialog (planned)
        CreateDirectMessageDialog.vue           # friend picker dialog (planned)
    composables/message/room/
      useReadDirectMessages.ts                  # fetches DM list + participant map (implemented)
      useDirectMessageName.ts                   # derives display name from participants (implemented)
    store/message/room/
      directMessage.ts                          # DM list state + createDirectMessage/hide actions (implemented)
  server/trpc/routers/room/
    directMessage.ts                            # createDirectMessage, readDirectMessages,
                                                # readDirectMessageParticipants, hideDirectMessage (implemented)
```
