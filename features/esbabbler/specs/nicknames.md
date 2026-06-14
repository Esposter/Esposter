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
getNicknameMap(roomId)?.get(user.id) ?? user.name;

// CORRECT
getNicknameMap(roomId)?.get(user.id) || user.name;
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

Two internal maps, both keyed by `roomId → inner map`:

- **`userToRoomMap`** — `Map<roomId, Map<userId, UserToRoomInMessage>>` — stores the **current user's own** full row (notificationType, lastMessageAt, isHidden, etc.); populated by `readMyUsersToRooms` and the `onUpdateUserToRoom` subscription
- **`nicknameMap`** — `Map<roomId, Map<userId, string>>` — stores **all members'** nicknames (including self); populated by `readNicknames` (called per-room from `readMetadata`) and the `onUpdateUserToRoom` subscription

Key exports:

- `getDisplayName(user, roomId)` — `nickname || user.name` lookup via `nicknameMap`; use this everywhere
- `getUserToRoomMap(roomId)` — cross-room access to private self-data (unread indicators, notification type)
- `setUserToRoom(roomId, userId, entry)` — writes into the self map
- `setNickname(roomId, userId, nickname)` — writes into the nickname map

### Endpoint split (privacy)

The old `readUsersToRooms` returned **all members' full rows**, leaking private fields (notificationType, lastMessageAt, isHidden) to every room member. It is replaced by two focused procedures:

| Procedure            | Input                   | Returns                          | Who                |
| :------------------- | :---------------------- | :------------------------------- | :----------------- |
| `readNicknames`      | `{ roomId, userIds[] }` | `{ userId, roomId, nickname }[]` | All listed members |
| `readMyUsersToRooms` | `{ roomIds[] }`         | Full `UserToRoomInMessage[]`     | Current user only  |

**`readNicknames`** is called from `readMetadata` inside `useReadMembers`, so nicknames are loaded alongside member roles and user statuses whenever the member list is fetched.

**`readMyUsersToRooms`** is called from `useReadRooms` to pre-load the current user's private settings (unread state, notification type) for all rooms at startup.

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

## UI: Setting Your Nickname

Room settings → **My Profile** tab (visible to all members, no permission required).

- Text field pre-filled with current nickname; empty = no nickname (falls back to global username)
- Saves on blur or Enter via `updateUserToRoom({ roomId, nickname })`
- Update propagates via `onUpdateUserToRoom` subscription → `setUserToRoom` + `setNickname`

Components:

- `Message/Model/Room/Settings/Type/Profile/Index.vue` — container with `v-container` layout
- `Message/Model/Room/Settings/Type/Profile/NicknameField.vue` — text field (max 32 chars)

---

## Implementation Status

- [x] `nickname` column on `usersToRoomsInMessage` (migration applied)
- [x] `getDisplayName` in `useUserToRoomStore` (via `nicknameMap`)
- [x] `readNicknames` endpoint — member-ID-based, public fields only
- [x] `readMyUsersToRooms` endpoint — self-only, full row
- [x] `nicknameMap` in store — separate from private self data
- [x] `useReadNicknames` composable — called from `readMetadata` in `useReadMembers`
- [x] `useReadMyUsersToRooms` composable — called from `useReadRooms`
- [x] `useMessageWithMentions` — mention label resolution with nickname
- [x] `MemberListItem` — sidebar member list
- [x] `MemberPanelListItem` — permissions panel member list
- [x] Push notification title uses nickname
- [x] `onUpdateUserToRoom` subscription updates both maps
- [x] **My Profile** settings tab — nickname field for all members
- [ ] `ManageNicknames` permission for setting others' nicknames (new `RoomPermission` bit before `ManageWebhooks`)
