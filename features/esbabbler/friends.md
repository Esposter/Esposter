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

Three separate tables encode relationship state — no status enum needed.

### `friend_requests` table — pending requests only

```typescript
// packages/db-schema/src/schema/friendRequests.ts

export const friendRequests = pgTable("friend_requests", {
  // Natural key — sorted([senderId, receiverId]).join(ID_SEPARATOR).
  // Conflict on insert = idempotent: duplicate sends are no-ops.
  id: text("id").primaryKey(),
  senderId: text("senderId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiverId: text("receiverId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});
```

### `friends` table — accepted friendships only

```typescript
// packages/db-schema/src/schema/friends.ts

export const friends = pgTable("friends", {
  // Same natural key — sorted([senderId, receiverId]).join(ID_SEPARATOR).
  id: text("id").primaryKey(),
  senderId: text("senderId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiverId: text("receiverId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});
```

`senderId`/`receiverId` are preserved on both tables to maintain directionality (who initiated the request). Both use the same `id` computation so any "are these two friends?" check is an O(1) PK lookup on either table.

### `blocks` table — blocked users

```typescript
// packages/db-schema/src/schema/blocks.ts

export const blocks = pgTable(
  "blocks",
  {
    blockerId: text("blockerId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedId: text("blockedId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  { extraConfig: ({ blockerId, blockedId }) => [primaryKey({ columns: [blockerId, blockedId] })] },
);
```

Blocking is unilateral and independent of friendship state. A block in either direction prevents friend requests and excludes the blocked user from search results.

### `id` idempotency

`id = [senderId, receiverId].toSorted().join(ID_SEPARATOR)`

This mirrors the `participantKey` pattern used on the `rooms` table for DMs — a deterministic text key from two participants. Because it is the PK:

- If A sends a request to B, `id = sorted([A, B]).join('|')`
- If B tries to send a request to A before accepting, the insert conflicts on `id` → no-op
- Any query checking "do A and B have a relationship?" is a single O(1) PK lookup

### State machine

```text
(no row anywhere)  ──sendFriendRequest──►  friend_requests row
friend_requests    ──acceptFriendRequest──► (deleted) + friends row inserted
friend_requests    ──declineFriendRequest──► (deleted)
friends            ──deleteFriend──────────► (deleted)
friends/requests   ──blockUser─────────────► both rows deleted + blocks row inserted
blocks             ──unblockUser───────────► (deleted)
```

---

## API

### `packages/app/server/trpc/routers/friend.ts`

| Procedure      | Input          | Action                                                                                                    |
| -------------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| `deleteFriend` | `friendId`     | DELETE from `friends` WHERE `id=sorted([me,friendId]).join(sep)`.                                         |
| `readFriends`  | —              | SELECT from `friends` WHERE `senderId=me OR receiverId=me`. Returns `User[]` of the other party via join. |
| `searchUsers`  | `name: string` | `WHERE ilike(users.name, '%name%')` excluding self and any block relationship in either direction.        |

### `packages/app/server/trpc/routers/friendRequest.ts`

| Procedure              | Input        | Action                                                                                                            |
| ---------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `sendFriendRequest`    | `receiverId` | Insert into `friend_requests` with `id=sorted([me,receiverId]).join(sep)`. Conflict on `id` → no-op (idempotent). |
| `acceptFriendRequest`  | `senderId`   | Transaction: DELETE from `friend_requests` WHERE `id=X AND receiverId=me`, then INSERT into `friends`.            |
| `declineFriendRequest` | `senderId`   | DELETE from `friend_requests` WHERE `id=X AND receiverId=me`.                                                     |
| `readFriendRequests`   | —            | SELECT from `friend_requests` WHERE `senderId=me OR receiverId=me`. Returns `FriendRequestWithRelations[]`.       |

### `packages/app/server/trpc/routers/block.ts`

| Procedure          | Input           | Action                                                                                                         |
| ------------------ | --------------- | -------------------------------------------------------------------------------------------------------------- |
| `blockUser`        | `targetUserId`  | DELETE from `friends` and `friend_requests` by id. INSERT into `blocks`. Idempotent via `onConflictDoNothing`. |
| `unblockUser`      | `blockedUserId` | DELETE from `blocks` WHERE `blockerId=me AND blockedId=target`.                                                |
| `readBlockedUsers` | —               | SELECT from `blocks` WHERE `blockerId=me`. Returns `User[]`.                                                   |

---

## Folder Structure

```text
packages/db-schema/src/
  schema/friendRequests.ts                      # friend_requests table
  schema/friends.ts                             # friends table (accepted only)
  schema/blocks.ts                              # blocks table
  models/shared/DatabaseEntityType.ts           # Friend + FriendRequest + Block variants

packages/app/
  app/
    components/Message/
      LeftSideBar/
        Index.vue                               # add Friends nav item above Rooms
    pages/messages/
      friends.vue                               # Friends management page
    store/message/user/
      friend.ts                                 # friends state
      friendRequest.ts                          # pendingRequests / sentRequests state
      block.ts                                  # blockedUsers state
    composables/message/user/
      useReadFriends.ts                         # populates friend store from tRPC
    composables/message/subscribables/
      useFriendSubscribables.ts                 # real-time subscriptions for friend events
  server/trpc/routers/
    friend.ts                                   # deleteFriend, readFriends, searchUsers
    friendRequest.ts                            # sendFriendRequest, acceptFriendRequest, declineFriendRequest, readFriendRequests
    block.ts                                    # blockUser, unblockUser, readBlockedUsers
    index.ts                                    # register friendRouter, friendRequestRouter, blockRouter
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

- **Friend request notifications**: should the recipient receive a Web Push notification when a friend request arrives? Low-urgency — can be added alongside the main notification pass.
- **Mutual friend discovery**: "You may know" suggestions based on shared room membership — YAGNI at current scale.
