# Esbabbler — Direct Messages Architecture

## Overview

Private 1:1 and small-group (up to 10 participants) conversations outside of public rooms. DMs reuse the entire message infrastructure (tRPC routers, Azure Table storage, all message components) by introducing a new `RoomType.DirectMessage` variant on the existing rooms table.

---

## User Experience

- The sidebar gains a **Direct Messages** section below the room list, sorted by most-recent message
- Click on any user's avatar or name → **Send Message** → navigates to the existing DM thread (creates it if it doesn't exist yet)
- **New Group DM** button → multi-user picker → creates a group DM room
- DM rooms are invisible to non-participants — no public discovery
- Group DMs show a generated name ("You, Alice, Bob") unless the creator sets a custom name
- 1:1 DM names are derived at display time from the other participant's username (never stored, so they stay fresh)

---

## Data Model

### Schema change — rooms table

Add a `type` column (default `RoomType.Room` for all existing rows):

```typescript
// packages/db-schema/src/models/room/RoomType.ts
export enum RoomType {
  Room = "Room",
  DirectMessage = "DirectMessage",
}
```

```typescript
// packages/db-schema/src/schema/rooms.ts  (additive change)
type: text("type").notNull().default(RoomType.Room).$type<RoomType>(),
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

Before inserting a new room, the mutation queries for an existing `RoomType.DirectMessage` room whose `usersToRooms` participant set exactly matches the provided `userIds`. If found, return it; otherwise create it. This prevents duplicate DM threads.

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
  schema/rooms.ts                     # add type column
  schema/usersToRooms.ts              # add isHidden column
  models/room/RoomType.ts             # new enum

packages/app/
  app/
    components/Room/
      Sidebar/
        DirectMessageList.vue         # DM section (mirrors RoomList.vue)
        DirectMessageItem.vue         # single DM row — other user's avatar for 1:1, generated name for group
    composables/room/
      useCreateDirectMessage.ts       # wraps createDirectMessage mutation; navigates on success
  server/trpc/routers/room/
    directMessage.ts                  # createDirectMessage, hideDirectMessage mutations
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
