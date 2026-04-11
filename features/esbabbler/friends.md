# Esbabbler — Friends Architecture

Bidirectional friend-request system. Mutual friends are the only source of DM recipients — no separate messaging permissions layer needed.

## User Experience

- **Friends** nav item (above Rooms) → `/messages/friends`
- Page sections: **Add Friend** (search by name), **Pending Requests** (Accept/Decline), **Friends** (list with Remove)
- Accepted friends appear in **New Message** dialog (see [`direct-messages.md`](direct-messages.md))

## Data Model

Three separate tables encode relationship state — no status enum needed.

### `friend_requests` table — pending requests only

```typescript
// packages/db-schema/src/schema/friendRequests.ts

export const friendRequests = pgTable("friend_requests", {
  // Natural key — getFriendshipId(senderId, receiverId).
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
  // Same natural key — getFriendshipId(senderId, receiverId).
  id: text("id").primaryKey(),
  senderId: text("senderId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiverId: text("receiverId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});
```

Directionality preserved (who initiated). Same `id` computation → O(1) friendship check on either table.

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

Blocking is unilateral. Either direction prevents friend requests and excludes from search.

### `id` idempotency

`id = getFriendshipId(senderId, receiverId)` — deterministic text PK (mirrors `participantKey` on rooms). Duplicate send → conflict on `id` → no-op. Relationship check → O(1) PK lookup.

### State machine

```text
(no row anywhere)  ──sendFriendRequest──►  friend_requests row
friend_requests    ──acceptFriendRequest──► (deleted) + friends row inserted
friend_requests    ──declineFriendRequest──► (deleted)
friends            ──deleteFriend──────────► (deleted)
friends/requests   ──blockUser─────────────► both rows deleted + blocks row inserted
blocks             ──unblockUser───────────► (deleted)
```

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

## Relationship to Direct Messages

Friends are the only DM recipients. New Message dialog lists accepted friends → `createDirectMessage(selectedUserIds)` → DM room created/surfaced.

## Open Questions

- **Friend request notifications**: should the recipient receive a Web Push notification when a friend request arrives? Low-urgency — can be added alongside the main notification pass.
- **Mutual friend discovery**: "You may know" suggestions based on shared room membership — YAGNI at current scale.
