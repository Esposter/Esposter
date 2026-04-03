# Esbabbler — Direct Messages Architecture

## Overview

Private 1:1 and small-group (up to 10 participants) conversations outside of public rooms. DMs reuse the entire message infrastructure (tRPC routers, Azure Table storage, all message components) by introducing a new `RoomType.DirectMessage` variant on the existing rooms table.

---

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

---

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

---

## API Changes

New/modified tRPC procedures:

| Procedure             | Location                        | Notes                                                                                                           |
| --------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `createDirectMessage` | `routers/room/directMessage.ts` | Finds or creates a DM room for the given set of `userIds`; idempotent — two users always share the same DM room |
| `listRooms`           | `routers/room/index.ts`         | Add optional `type` filter; client fetches rooms and DMs separately                                             |
| `hideDirectMessage`   | `routers/room/directMessage.ts` | Sets `isHidden = true` on the caller's `usersToRooms` row                                                       |

### Idempotency in `createDirectMessage`

Compute `participantKey = userIds.toSorted().join(ID_SEPARATOR)` before the insert and use an upsert (insert-on-conflict-do-nothing) keyed on `participantKey`. This makes the idempotency check a single unique-index lookup — O(1) — rather than a set-intersection query across `usersToRooms`. Duplicate DM threads are prevented at the DB level via the unique constraint.

### Permissions

All existing room-level permission checks use the `usersToRooms` membership check — DMs automatically inherit the same gating with no changes to the auth layer.

Additional constraints enforced in `createDirectMessage` and room middleware:

- Public join/invite links (`invites` table) are rejected for `RoomType.DirectMessage`
- Room discovery / `listPublicRooms` excludes DMs
- Max 10 participants enforced on `createDirectMessage`

---

## Notifications

DMs should default to **notify on every message** regardless of the room's notification setting. On `createMessage`, if the room type is `DirectMessage` bypass the keyword-rule check and always publish to the recipient's Web Push subscription.

---

## Folder Structure

Changes are additive to the existing room infrastructure — no new top-level folders:

```
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
  server/trpc/routers/
    directMessage.ts                            # createDirectMessage, readDirectMessages,
                                                # readDirectMessageParticipants, hideDirectMessage (implemented)
```

---

## What Does Not Change

- All message tRPC routers — DM rooms use identical `roomId`-keyed message storage
- All message components — same rendering pipeline
- Voice channel — DM rooms can optionally get voice support later; `RoomType.DirectMessage` just needs to be allowed in `joinVoiceChannel`
- Emoji reactions, quote replies, polls, file uploads — all work inside DMs without modification
- Rate limiting / slowmode — inherited from existing `createMessage` guards

---

## Open Questions

- **Max group DM size**: 10 (Slack's model) — beyond that, the UX nudges users to create a room instead
- **Re-adding hidden participants**: if a user hid a group DM and is re-invited, reset `isHidden = false` on their row
- **Read state**: DMs are a natural candidate for unread badges (already ruled out room-wide in v1, but DMs have higher urgency — worth revisiting)
- **Admin visibility**: should server admins be able to see DMs? Recommend no — store and treat them as private
