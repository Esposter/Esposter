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

| Entity                                   | Role                                                                                                                                                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `callSessionsInMessage`                  | Persistent call row. `id` (12-char alphanumeric) is both the session key and the shareable join code. `userId` is the creator who can join a standalone call directly. Room sessions are created lazily on first `joinCallByRoomId`. |
| `callSessionParticipantMap` (in-memory)  | `Map<callSessionId, Map<sessionId, CallParticipant>>`. Lost on server restart.                                                                                                                                                       |
| `callAdmittedParticipantMap` (in-memory) | `Map<callSessionId, Set<sessionId>>`. One-time standalone waiting-room admissions. Consumed by `joinCall({ id })`.                                                                                                                   |
| `callStartTimeMap` (in-memory)           | `Map<callSessionId, Date>`. Tracks call start for duration calculation.                                                                                                                                                              |

### Token vs code terminology

All short random codes in this project are called **tokens**:

- `invitesInMessage.token` (length 8) — invite link token
- `callSessionsInMessage.id` (length 12) — the `id` IS the shareable call/meeting link token (no separate `token` field)
- `createToken(length)` from `#shared/util/math/random/createToken` — the single generator (uses `crypto.getRandomValues`)

Never use `code`, `createCode`, or `CODE_LENGTH` — those are the old names and have been deleted.

### Standalone vs room calls

Two distinct call entry points with different auth semantics:

| Aspect                | Room call                                  | Standalone call                                      |
| --------------------- | ------------------------------------------ | ---------------------------------------------------- |
| Procedure             | `joinCallByRoomId({ roomId })`             | `createCall()` then `joinCall({ id })`               |
| Auth requirement      | Room membership (via `getMemberProcedure`) | Auth only — no room membership                       |
| `callRoomId` in store | Set to the room ID                         | Empty `""`                                           |
| Page                  | Room's message view + `Panel/Dialog`       | `/calls/[id]`                                        |
| InviteCard shown      | No (hidden when `callRoomId` is set)       | Yes — shares `window.location.href`                  |
| RBAC / moderation     | Full room RBAC applies                     | No room — any participant can admit/dismiss knockers |

**`joinCall({ id })`** only works for standalone sessions (`callSession.roomId === null`). It throws `FORBIDDEN` if called with a room session ID. Room calls must be joined via `joinCallByRoomId`. For standalone calls, it only succeeds for the creator (`callSessionsInMessage.userId`) or for a session ID that was just admitted via `admitKnocker`.

**`createCall()`** creates a new standalone (roomless) call session with `userId = ctx.getSessionPayload.user.id` and returns its `callSessionId`. The `/calls` page calls this to start a new call, then navigates to `/calls/[callSessionId]`.

### Call session lifecycle

1. **Room entry**: `readCallSessionId({ roomId })` → reads `callSessionsInMessage`, returns `id` string (`""` if no session yet). Called by `useCallSubscribables` whenever the viewed room changes; subscriptions are skipped when `""`.
2. **Join via room**: `joinCallByRoomId({ roomId })` → room membership required → creates session row if none exists (3-retry upsert inline) → returns `{ callSessionId, participants, livekitUrl, livekitToken }`.
3. **Join via id**: `joinCall({ id })` → auth only (no room membership) → finds **standalone** session by id → allows creator or admitted session → same join flow.
4. **Subscriptions** (`onJoinCall`, `onLeaveCall`, `onSetMute`, `onVideoChanged`) take `callSessionId` (not `roomId`). Auth only — caller must have obtained the `callSessionId` through an authenticated call.
5. **Leave**: `leaveCall({ callSessionId })`. Throws `NOT_FOUND` if caller is not a participant. When the last participant leaves: writes call duration as `MessageType.Call` system message to the room.

### Call leave boundaries

Only these actions remove the local participant:

- **User intent**: clicking **Leave Call** in room controls, call view, or status bar.
- **Moderation**: `KickFromCall`, `KickFromRoom`, `TimeoutUser`, `CreateBan` when `callRoomId` matches.
- **Session loss**: logout, tab close, browser crash, or LiveKit disconnect (`participant_left` webhook).
- **`/calls/[id]` unmount**: the standalone call page is the whole call surface; leaving the route leaves the call.

Room navigation (`useCallSubscribables` cleanup) is **not** a leave boundary. It only clears `currentRoomCallSessionId` and unsubscribes room observers — it never calls `leaveCall` or disconnects LiveKit.

### Client-side call stores

`useCallStore` (`store/message/room/call/index.ts`) tracks:

- `activeCallSessionId` — session ID of the call the user is **in** (drives `leaveCall`, `setMute`, `setCamera`).
- `currentRoomCallSessionId` — session ID for the **viewed** room (set by `useCallSubscribables`, drives `roomParticipants` display). Reset to `""` on room leave.
- `callRoomId` — room ID of active call, kept **only** for admin action roomId checks. Empty for standalone calls.
- `isCallViewOpen` — controls the `Panel/Dialog.vue` fullscreen overlay in room calls.

`useParticipantStore` (`call/participant.ts`): `callSessionParticipantsMap` (`Map<callSessionId, Map<sessionId, CallParticipant>>`), `speakingIds`, `joinNoticeParticipant`.

### Call participant state — Map-based design

The client `callSessionParticipantsMap` mirrors the server-side structure: `Map<callSessionId, Map<sessionId, CallParticipant>>`. This gives O(1) lookups for all participant mutations (`setMute`, `setHandRaised`, `setParticipantCamera`, `deleteCallParticipant`) without scanning arrays.

**Key rules:**

- **Don't add a separate tracking collection** for state that already lives on `CallParticipant`. `isHandRaised` on the participant object replaces any external `handRaisedIdsMap`. Before adding a new parallel state map, check if the field belongs on `CallParticipant` itself.
- **tRPC boundary stays as `CallParticipant[]`** — JSON can't represent Maps. The server returns an array; `setParticipants` converts it to a Map on the client. Don't change the tRPC return type.
- **Iteration in Vue templates** — iterate participant values with `v-for="participant of myMap.values()"`, not by converting to an array first. Use `.size` instead of `.length`.
- **Mutation through the reactive chain** — always obtain a participant via `callSessionParticipantsMap.value.get(callSessionId)?.get(sessionId)` (not via a local variable captured before the reactive lookup) so Vue's proxy intercepts the property assignment and triggers re-renders.
- **`selfParticipant` computed** — derive `isInCall`, `isMuted`, `isHandRaised` for the current session from one `computed(() => sessionId.value ? callParticipants.value.get(sessionId.value) : undefined)` rather than calling `.find()` or `.includes()` per derived value.

```ts
// WRONG — redundant tracking array, O(n) lookups, wasteful spread
const handRaisedIdsMap = ref(new Map<string, string[]>());
const isHandRaised = computed(() => getHandRaisedIds(callSessionId).includes(sessionId));
const isMuted = computed(() => callParticipants.value.find(({ id }) => id === sessionId.value)?.isMuted ?? false);

// CORRECT — Map-based, O(1), state on the entity
// callSessionParticipantsMap: Map<callSessionId, Map<sessionId, CallParticipant>>
const selfParticipant = computed(() => sessionId.value ? callParticipants.value.get(sessionId.value) : undefined);
const isInCall = computed(() => !!selfParticipant.value);
const isHandRaised = computed(() => selfParticipant.value?.isHandRaised ?? false);
const isMuted = computed(() => selfParticipant.value?.isMuted ?? false);

// template iteration
v-for="participant of callParticipants.values()"
```

`useMediaStore` (`call/media.ts`): `isDeafened`, `isForceMuted`, `isCameraEnabled`, `isScreenSharing`, `screenSharingParticipantIds`, `pinnedParticipantId`, `selectedVirtualBackground`, `localVideoStream`, `remoteVideoStreams`, `localScreenShareStream`, `remoteScreenShareStreams`.

`useLiveKitStore` (`store/message/room/liveKit.ts`) wraps the LiveKit `Room`: `connect`, `disconnect`, `setCamera`, `setMicrophone`, `setRemoteAudioMuted`, `setScreenShare`, `setVirtualBackground`. All track/media logic lives here; `useCallStore` delegates to it.

### Shareable call link

- `/calls` — standalone call lobby; calls `createCall()` to create a new session, then navigates to `/calls/[id]`.
- `/calls/[id]` — full-screen standalone call; creator auto-joins by persisted `callSessionsInMessage.userId`, everyone else sees pre-join and must knock.
- `InviteCard.vue` is only shown on the `/calls/[id]` page (hidden when `callRoomId` is set). It copies `window.location.href` which is the correct `/calls/[id]` URL in standalone context.

### Admin actions and calls

Admin action hooks in `useCallStore` receive `roomId`. Compare against `callRoomId` (not `activeCallSessionId`) since admin actions are room-scoped:

```ts
AdminActionHookMap[AdminActionType.ForceMute].push(async (roomId) => {
  if (sessionId.value) setMute(currentRoomCallSessionId.value, sessionId.value, true);
  if (callRoomId.value !== roomId) return;
  await setMicrophone(false);
  mediaStore.isForceMuted = true;
});

AdminActionHookMap[AdminActionType.StopScreenShare].push(async (roomId) => {
  if (callRoomId.value !== roomId) return;
  await setScreenShare(false);
});
```

`KickFromCall` does not check `callRoomId` — it always leaves regardless of room.

### RBAC — `RoomPermission` bits

Current bit assignments (in `packages/db-schema/src/schema/roomRolesInMessage.ts`):

| Permission        | Bit | Value | Notes                                             |
| ----------------- | --- | ----- | ------------------------------------------------- |
| `ReadMessages`    | 0   | 1     |                                                   |
| `SendMessages`    | 1   | 2     |                                                   |
| `ManageMessages`  | 2   | 4     | delete/pin others'; also Warn admin action        |
| `MentionEveryone` | 3   | 8     | @here / @everyone                                 |
| `ManageRoom`      | 4   | 16    | edit room settings                                |
| `ManageRoles`     | 5   | 32    | create/edit/delete roles below own position       |
| `ManageInvites`   | 6   | 64    | create/delete invite codes                        |
| `KickMembers`     | 7   | 128   | KickFromRoom + TimeoutUser                        |
| `BanMembers`      | 8   | 256   | CreateBan + SoftBan                               |
| `MuteMembers`     | 9   | 512   | ForceMute / ForceUnmute / **StopScreenShare**     |
| `MoveMembers`     | 10  | 1024  | KickFromCall                                      |
| `ManageNicknames` | 11  | 2048  | set per-room nicknames for other members          |
| `ManageWebhooks`  | 12  | 4096  | create/edit/delete webhooks                       |
| `Administrator`   | 13  | 8192  | all perms; bypasses hierarchy; always highest bit |

`Administrator` **must** remain the highest bit. New permissions go before `Administrator`, incrementing its bit (requires migration to update stored values).

### `AdminActionType` enum

```ts
enum AdminActionType {
  CreateBan,
  ForceMute,
  ForceUnmute,
  KickFromCall,
  KickFromRoom,
  SoftBan,
  StopScreenShare,
  TimeoutUser,
  Warn,
}
```

`StopScreenShare` permission: `MuteMembers`. Client hook calls `setScreenShare(false)` when `callRoomId` matches. Notification: "Your screen share has been stopped by a moderator."

### Knock/Admit (lobby/waiting room)

Scope: standalone calls only. Room calls stay gated by room membership/RBAC.

- `knockCall({ id })` — adds caller to `callKnockerMap`; emits `onKnockCall` to participants.
- `admitKnocker` / `dismissKnocker` — called by any participant; `admitKnocker` adds a one-time session admission in `callAdmittedParticipantMap`, then emits `onKnockerAdmitted` to the knocker.
- `/calls/[id]` page states: `idle` (pre-join) → `knocking` (waiting overlay) → `joined` (full CallView).
- Creator (`callSessionsInMessage.userId`) skips straight to `joined`; everyone else must be admitted.
- `JoinNotice.vue` upgraded to show "Let In" / "Dismiss" per knocker.

Full spec in `features/esbabbler/completed/v5.md` → Phase 5.

## Store Mutation Pattern — Subscriptions as Source of Truth

Subscriptions handle state updates for **all** clients including the caller. Don't duplicate subscription work in a store wrapper.

**Default**: call `$trpc` directly from the component. Add a store function only when it does something subscriptions cannot:

1. Genuine optimistic update (local state before server responds)
2. Navigation or side effects not covered by any subscription
3. Combines multiple mutations or concerns

```ts
// WRONG — wrapper that duplicates subscription work
const deleteDirectMessageParticipant = async (input) => {
  await $trpc.room.directMessage.deleteDirectMessageParticipant.mutate(input);
  // ❌ onLeaveRoom subscription already handles participant removal on all clients
  const participants = directMessageParticipantsMap.value.get(input.roomId) ?? [];
  directMessageParticipantsMap.value.set(input.roomId, participants.filter(...));
};

// CORRECT — call tRPC directly in the component; subscription owns state
$trpc.room.directMessage.deleteDirectMessageParticipant.mutate({ roomId, userId });
```

### Genuine optimistic update — `createMessage` is the canonical example

- Create a reactive entity locally with `isLoading: true` **before** the tRPC call so it renders immediately
- After the call, `Object.assign` the server response onto the same reactive object (same reference, no re-render flicker)
- Delete the `isLoading` flag — subscription receives the real event but the message is already in the list; deduplication happens by composite key

```ts
const createMessage = async (input: StandardCreateMessageInput) => {
  const newMessage = reactive(createMessageEntity({ ...input, isLoading: true, userId: session.data.user.id }));
  await storeCreateMessage(newMessage); // renders immediately with loading state
  Object.assign(newMessage, await $trpc.message.createMessage.mutate(input)); // server response fills real data in-place
  delete newMessage.isLoading;
};
```

Use this pattern only when the delay would be visibly jarring (message send). For participant join/leave, hide/delete DM, and similar actions a subscription round-trip is imperceptible and the simplicity is worth it.

## Stable Watch Sources for `useOnlineSubscribable`

When subscriptions only need to react to **membership changes** (rooms added or removed), watch a stable primitive instead of the full reactive array. A sorted array returned by `toSorted()` produces a new reference on every `updatedAt` change, causing unnecessary subscription teardown and rebuild on every incoming message.

```ts
// WRONG — re-subscribes on every updatedAt bump (every incoming message)
useOnlineSubscribable(directMessages, (newDirectMessages) => { ... });

// CORRECT — stable string; only changes when the set of IDs changes
useOnlineSubscribable(
  () => directMessages.value.map(({ id }) => id).toSorted().join(","),
  (roomIdsString) => {
    if (!roomIdsString) return undefined;
    const roomIds = roomIdsString.split(",");
    // set up subscriptions…
  },
);
```

A plain getter `() => expr` is equivalent to `computed(() => expr)` as a watch source and is preferred — no extra ref allocation.
