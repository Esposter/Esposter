---
name: esbabbler
description: Esposter messaging feature (esbabbler) conventions — display name resolution, nickname system, call session architecture, token generation, and where each concern lives. Apply when working on the messaging module (packages/app/app/…/message/, server/trpc/routers/message/, userToRoom, roles, members, rooms, calls).
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

## Call System Architecture

Calls are built on top of `callSessionsInMessage` (Postgres) + ephemeral in-memory maps. The session persists; the participants do not.

### Key entities

| Entity                                  | Role                                                                                                                                                              |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `callSessionsInMessage`                 | One persistent row per room. `id` (UUID) is the call session key. `token` (12-char alphanumeric) is the shareable join code. Created lazily on `readCallSession`. |
| `callSessionParticipantMap` (in-memory) | `Map<callSessionId, Map<sessionId, CallParticipant>>`. Lost on server restart.                                                                                    |
| `callStartTimeMap` (in-memory)          | `Map<callSessionId, Date>`. Tracks call start for duration calculation.                                                                                           |

### Token vs code terminology

All short random codes in this project are called **tokens**:

- `invitesInMessage.token` (length 8) — invite link token
- `callSessionsInMessage.token` (length 12) — shareable call/meeting link token
- `createToken(length)` from `#shared/util/math/random/createToken` — the single generator (uses `crypto.getRandomValues`)

Never use `code`, `createCode`, or `CODE_LENGTH` — those are the old names and have been deleted.

### Call session lifecycle

1. **Room entry**: `readCallSession({ roomId })` → `getOrCreateCallSession` → upserts the session row, returns `{ id, token, roomId }`. Called by `useCallSubscribables` whenever the viewed room changes.
2. **Join via room**: `joinCall({ roomId })` → room membership required → reuses the existing session → returns `{ callSessionId, participants }`.
3. **Join via token**: `joinCallByToken({ token })` → auth only (no room membership) → finds session by token → same join flow.
4. **Subscriptions** (`onJoinCall`, `onLeaveCall`, `onSetMute`, `onSendSignal`) take `callSessionId` (not `roomId`). Auth only — caller must have obtained the `callSessionId` through an authenticated call.
5. **Leave**: `leaveCall({ callSessionId })`. On last leaver: writes call duration as `MessageType.Call` system message to the room.

### Client-side call stores

`useCallStore` tracks:

- `activeCallSessionId` — session ID of the call the user is **in** (drives `leaveCall`, `setMute`, `sendSignal`).
- `currentRoomCallSessionId` — session ID for the **viewed** room (set by `useCallSubscribables`, drives `roomParticipants` display). Reset to `""` on room leave.
- `callRoomId` — room ID of active call, kept **only** for admin action roomId checks (ForceMute, KickFromCall, etc.).
- `callSessionParticipantsMap` — `Map<callSessionId, CallParticipant[]>`.

`useWebRtcStore` uses `callSessionId` (not `roomId`) for all `sendSignal` mutations and subscriptions.

### Shareable call link

The call token gives a `/call/[token]` link that allows any authenticated user to join a call without being a room member. The page calls `joinCallByToken({ token })`.

### Admin actions and calls

Admin action hooks in `useCallStore` receive `roomId`. Compare against `callRoomId` (not `activeCallSessionId`) since admin actions are room-scoped:

```ts
AdminActionHookMap[AdminActionType.ForceMute].push((roomId) => {
  if (sessionId.value) setMute(currentRoomCallSessionId.value, sessionId.value, true);
  if (callRoomId.value !== roomId) return;
  setLocalStreamMuted(true);
  isForceMuted.value = true;
});
```
