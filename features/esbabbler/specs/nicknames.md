# Esbabbler — Per-Room Nicknames Spec

Members can set a per-room display name that overrides their global username within a given room.

---

## Data Model

### `usersToRooms` — `nickname` column

| Column     | Type | Notes                                                         |
| :--------- | :--- | :------------------------------------------------------------ |
| `nickname` | text | NOT NULL DEFAULT ""; max 32 chars; empty string = no nickname |

Stored as `text().notNull().default("")`. Empty string means "no nickname set" — never store null.

---

## Display Name Resolution

All member name display goes through `getDisplayName(user, roomId)` from `useUserToRoomStore`. Never read `user.name` or `member.name` directly in a room context.

```ts
// WRONG — ignores room nickname
{{ creator.name }}
<StyledAvatar :name="member.name" />

// CORRECT — respects room nickname, falls back to global name
{{ getDisplayName(member, roomId) }}
<StyledAvatar :name="getDisplayName(member, roomId)" />
```

### `||` not `??` for nickname fallback

Nicknames are stored as `text().notNull().default("")`. Empty string is falsy — use `||` to fall back:

```ts
// WRONG — empty string passes through, user sees blank name
getUserToRoomMap(roomId)?.get(user.id)?.nickname ?? user.name;

// CORRECT
getUserToRoomMap(roomId)?.get(user.id)?.nickname || user.name;
```

---

## Where Nickname Is Applied

| Location                          | Component / Code                                                                       |
| :-------------------------------- | :------------------------------------------------------------------------------------- |
| Mention labels in message body    | `useMessageWithMentions(message, () => message.partitionKey)`                          |
| Member list sidebar               | `MemberListItem` — `displayName = computed(() => getDisplayName(member, room.id))`     |
| Role permission panel member list | `MemberPanelListItem` — `displayName = computed(() => getDisplayName(member, roomId))` |
| Push notification title           | `server/trpc/routers/message/index.ts` — queries `nickname` before EventGrid publish   |

`useCreator` does **not** overlay the nickname — components that need the nickname for the message creator display must call `getDisplayName` directly when needed.

---

## Client State: `useUserToRoomStore`

Single store for all `usersToRoomsInMessage` client state. Inner map: `Map<roomId, Map<userId, UserToRoomInMessage>>`.

Key exports:

- `getDisplayName(user, roomId)` — `nickname || user.name` lookup; use this everywhere
- `getUserToRoomMap(roomId)` — cross-room access (e.g. unread indicators)
- `setUserToRoom(roomId, userId, entry)` — merge-writes into the map

Populated by `readUsersToRooms` (queries all members' rows for given rooms, not filtered to own user — gives nicknames for all members in one call).

---

## Push Notification Title

```ts
const nickname = (await ctx.db.query.usersToRoomsInMessage.findFirst({
  columns: { nickname: true },
  where: { roomId: newMessageEntity.partitionKey, userId: ctx.getSessionPayload.user.id },
}))?.nickname;
notificationOptions: { title: nickname || ctx.getSessionPayload.user.name, ... },
```

---

## Implementation Status

- [x] `nickname` column on `usersToRoomsInMessage` (migration applied)
- [x] `getDisplayName` in `useUserToRoomStore`
- [x] `useMessageWithMentions` — mention label resolution with nickname
- [x] `MemberListItem` — sidebar member list
- [x] `MemberPanelListItem` — permissions panel member list
- [x] Push notification title uses nickname
- [x] `readUsersToRooms` returns all members' rows (not own-user-only)
- [ ] UI to set own nickname (`setNickname({ roomId, nickname })` mutation + input in member panel or user profile)
- [ ] `ManageNicknames` permission for setting others' nicknames (new `RoomPermission` bit before `ManageWebhooks`)
