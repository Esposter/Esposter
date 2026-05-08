---
name: esbabbler
description: Esposter messaging feature (esbabbler) conventions — display name resolution, nickname system, and where each concern lives. Apply when working on the messaging module (packages/app/app/…/message/, server/trpc/routers/message/, userToRoom, roles, members, rooms).
---

# Esbabbler (Messaging) Feature Conventions

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

### Where nickname is applied

| Location                          | How                                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Mention labels in message body    | `useMessageWithMentions(message, roomId)` — pass `() => message.partitionKey` as second arg                  |
| Member list sidebar               | `MemberListItem` via `displayName = computed(() => getDisplayName(member, room.id))`                         |
| Role permission panel member list | `MemberPanelListItem` with `member` as prop — `displayName = computed(() => getDisplayName(member, roomId))` |
| Push notification title           | `message/index.ts` router queries `usersToRoomsInMessage.nickname` before publishing the EventGrid event     |

### `||` not `??` for nickname fallback

Nicknames are stored as `text().notNull().default("")`. Empty string `""` is falsy — use `||` to fall back to global name:

```ts
// WRONG — empty string passes through, user sees blank name
getUserToRoomMap(roomId)?.get(user.id)?.nickname ?? user.name;

// CORRECT
getUserToRoomMap(roomId)?.get(user.id)?.nickname || user.name;
```

## Push Notification Title

Push notification title is set in `server/trpc/routers/message/index.ts` before publishing to EventGrid. Look up the sender's room nickname:

```ts
const nickname = (await ctx.db.query.usersToRoomsInMessage.findFirst({
  columns: { nickname: true },
  where: { roomId: newMessageEntity.partitionKey, userId: ctx.getSessionPayload.user.id },
}))?.nickname;
notificationOptions: { icon: ..., title: nickname || ctx.getSessionPayload.user.name },
```
