# Esbabbler — Friends Architecture

## Overview

A bidirectional friend-request system that acts as the social graph for Direct Messages. Users must be mutual friends before they can appear in each other's DM picker. This keeps the platform from becoming an open messaging free-for-all while staying lightweight — no separate messaging permissions layer is needed.

---

## User Experience

- A **Friends** nav item in the sidebar (above Rooms) navigates to `/messages/friends`
- The Friends page has three sections:
  1. **Add Friend** — search users by name; send a friend request
  2. **Pending Requests** — incoming requests with Accept / Decline buttons
  3. **Friends** — list of accepted friends with a Remove button
- Accepted friends appear in the **New Message** dialog (see [`direct-messages.md`](direct-messages.md)) so you can start a DM with them

---

## Data Model

### Schema — `friends` table

```typescript
// packages/db-schema/src/schema/friends.ts

export enum FriendshipStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  Blocked = "Blocked",
}

export const friends = pgTable(
  "friends",
  {
    // Natural key — sorted([senderId, receiverId]).join(ID_SEPARATOR).
    // Text PK instead of UUID: every lookup goes through this value,
    // it never changes, and there is exactly one row per user pair.
    id: text("id").primaryKey(),

    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    receiverId: text("receiver_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: friendshipStatusEnum("status").notNull().default(FriendshipStatus.Pending),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  ({ senderId, receiverId }) => [check("no_self_friendship", sql`${senderId} != ${receiverId}`)],
);
```

`id` is a text PK (not UUID) computed as `sorted([senderId, receiverId]).join(ID_SEPARATOR)` — same logic as `participantKey` on `rooms`. It follows the same logic as `usersToRooms` using `(userId, roomId)` as its composite PK — no surrogate needed when the natural key is already stable and unique. `senderId`/`receiverId` stay as plain columns to preserve directionality: only the `receiverId` user can accept or decline a pending request.

### `id` idempotency

`id = [senderId, receiverId].toSorted().join(ID_SEPARATOR)`

This mirrors the `participantKey` pattern used on the `rooms` table for DMs — a deterministic text key computed from the two participants. Because it is the PK:

- If A sends a request to B, `id = sorted([A, B]).join('|')`
- If B tries to send a request to A before accepting, the insert conflicts on `id` → no-op
- Any query checking "do A and B have a relationship?" is a single O(1) PK lookup

### Status state machine

```text
(no row)  ──sendFriendRequest──►  Pending
Pending   ──acceptFriendRequest──► Accepted
Pending   ──declineFriendRequest──► (row deleted)
Accepted  ──deleteFriend──────────► (row deleted)
Accepted  ──blockUser──────────────► Blocked   (future)
```

---

## API

New tRPC router: `packages/app/server/trpc/routers/friend.ts`

| Procedure              | Input             | Action                                                                                                                |
| ---------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| `sendFriendRequest`    | `receiverId`      | Insert row with `id=sorted([me,receiverId]).join(sep)`, `status=Pending`. Conflict on `id` → no-op (idempotent).      |
| `acceptFriendRequest`  | `senderId`        | Update `WHERE id=sorted([senderId,me]).join(sep) AND receiverId=me AND status=Pending` → `status=Accepted`            |
| `declineFriendRequest` | `senderId`        | Delete `WHERE id=sorted([senderId,me]).join(sep) AND receiverId=me AND status=Pending`                                |
| `deleteFriend`         | `friendId`        | Delete `WHERE id=sorted([me,friendId]).join(sep) AND status=Accepted`                                                 |
| `readFriends`          | cursor pagination | `WHERE (senderId=me OR receiverId=me) AND status=Accepted`. Returns paginated `User[]` of the _other_ party via join. |
| `readPendingRequests`  | —                 | `WHERE receiverId=me AND status=Pending`. Returns `User[]` of senders.                                                |
| `readSentRequests`     | —                 | `WHERE senderId=me AND status=Pending`. Returns `User[]` of receivers.                                                |

Additional procedure in `packages/app/server/trpc/routers/friend.ts`:

| Procedure     | Input          | Action                                                                               |
| ------------- | -------------- | ------------------------------------------------------------------------------------ |
| `searchUsers` | `name: string` | `WHERE ilike(users.name, '%name%')` with limit. Used by the Add Friend search input. |

---

## Folder Structure

```text
packages/db-schema/src/
  schema/friends.ts                             # FriendshipStatus enum + friends table
  models/shared/DatabaseEntityType.ts           # add Friend variant

packages/app/
  app/
    components/Message/
      LeftSideBar/
        Index.vue                               # add Friends nav item above Rooms
    pages/messages/
      friends.vue                               # Friends management page
    store/message/
      friend.ts                                 # friends / pendingRequests / sentRequests state
    composables/message/friend/
      useReadFriends.ts                         # populates friend store from tRPC
  server/trpc/routers/
    friend.ts                                   # all friend procedures
    index.ts                                    # register friendRouter
```

---

## Relationship to Direct Messages

Friends are the only source of recipients in the New Message dialog. The flow is:

1. User navigates to Friends page → sends a friend request to another user
2. Recipient accepts on their Friends page
3. Either user clicks "+" next to Direct Messages → dialog lists their accepted friends
4. They select one or more friends → `createDirectMessage(selectedUserIds)` is called
5. The DM room is created (or the existing one is surfaced) and the user is navigated there

This keeps DM creation gated behind a mutual opt-in, matching the privacy expectations of a casual social platform.

---

## Open Questions

- **Blocked status**: the `Blocked` variant is reserved in the enum but not yet implemented. When added, blocked users should be excluded from `searchUsers` results for the blocker, and `sendFriendRequest` should reject if a block row exists in either direction.
- **Friend request notifications**: should the recipient receive a Web Push notification when a friend request arrives? Low-urgency — can be added alongside the main notification pass.
- **Mutual friend discovery**: "You may know" suggestions based on shared room membership — YAGNI at current scale.
