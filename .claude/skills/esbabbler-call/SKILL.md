---
name: esbabbler-call
description: Esposter messaging calls (esbabbler) implementation — call session architecture, standalone vs room calls, token generation, call lifecycle/leave boundaries, client call stores, participant Map design, RoomPermission bits, AdminActionType, and the knock/admit lobby. Apply when working on calls (store/message/room/call/, liveKit.ts, callSession routers, /calls pages).
---

# Esbabbler Calls — Implementation

Calls build on `callSessionsInMessage` (Postgres) + ephemeral in-memory maps. The session persists; participants do not.

## Key entities

| Entity                                   | Role                                                                                                                                                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `callSessionsInMessage`                  | Persistent call row. `id` (12-char alphanumeric) is both session key and shareable join code. `userId` is the creator who can join a standalone call directly. Room sessions created lazily on first `joinCallByRoomId`. |
| `callSessionParticipantMap` (in-memory)  | `Map<callSessionId, Map<sessionId, CallParticipant>>`. Lost on restart.                                                                                                                                                  |
| `callAdmittedParticipantMap` (in-memory) | `Map<callSessionId, Set<sessionId>>`. One-time standalone waiting-room admissions. Consumed by `joinCall({ id })`.                                                                                                       |
| `callStartTimeMap` (in-memory)           | `Map<callSessionId, Date>`. Tracks call start for duration calculation.                                                                                                                                                  |

## Token vs code terminology

All short random codes are **tokens**:

- `invitesInMessage.token` (length 8) — invite link token
- `callSessionsInMessage.id` (length 12) — the `id` IS the shareable call/meeting link token (no separate `token` field)
- `createToken(length)` from `#shared/util/math/random/createToken` — the single generator (uses `crypto.getRandomValues`)

Never use `code`, `createCode`, or `CODE_LENGTH` — old names, deleted.

## Standalone vs room calls

| Aspect                | Room call                                  | Standalone call                                      |
| --------------------- | ------------------------------------------ | ---------------------------------------------------- |
| Procedure             | `joinCallByRoomId({ roomId })`             | `createCall()` then `joinCall({ id })`               |
| Auth requirement      | Room membership (via `getMemberProcedure`) | Auth only — no room membership                       |
| `callRoomId` in store | Set to the room ID                         | Empty `""`                                           |
| Page                  | Room's message view + `Panel/Dialog`       | `/calls/[id]`                                        |
| InviteCard shown      | No (hidden when `callRoomId` is set)       | Yes — shares `window.location.href`                  |
| RBAC / moderation     | Full room RBAC applies                     | No room — any participant can admit/dismiss knockers |

- **`joinCall({ id })`** only works for standalone sessions (`callSession.roomId === null`); throws `FORBIDDEN` for a room session ID. Succeeds only for the creator (`callSessionsInMessage.userId`) or a session just admitted via `admitKnocker`. Room calls must use `joinCallByRoomId`.
- **`createCall()`** creates a new standalone (roomless) session with `userId = ctx.getSessionPayload.user.id`, returns `callSessionId`. `/calls` calls this then navigates to `/calls/[callSessionId]`.

## Call session lifecycle

1. **Room entry**: `readCallSessionId({ roomId })` → reads `callSessionsInMessage`, returns `id` (`""` if none). Called by `useCallSubscribables` on viewed-room change; subscriptions skipped when `""`.
2. **Join via room**: `joinCallByRoomId({ roomId })` → membership required → creates session row if none (3-retry upsert inline) → returns `{ callSessionId, participants, livekitUrl, livekitToken }`.
3. **Join via id**: `joinCall({ id })` → auth only → finds **standalone** session by id → allows creator or admitted session → same join flow.
4. **Subscriptions** (`onJoinCall`, `onLeaveCall`, `onSetMute`, `onVideoChanged`) take `callSessionId` (not `roomId`); auth only — caller must have obtained the `callSessionId` through an authenticated call.
5. **Leave**: `leaveCall({ callSessionId })`. Throws `NOT_FOUND` if caller not a participant. On last participant leaving: writes call duration as `MessageType.Call` system message to the room.

## Call leave boundaries

Only these remove the local participant:

- **User intent**: clicking **Leave Call** in room controls, call view, or status bar.
- **Moderation**: `KickFromCall`, `KickFromRoom`, `TimeoutUser`, `CreateBan` when `callRoomId` matches.
- **Session loss**: logout, tab close, browser crash, LiveKit disconnect (`participant_left` webhook).
- **`/calls/[id]` unmount**: the standalone page is the whole call surface; leaving the route leaves the call.

Room navigation (`useCallSubscribables` cleanup) is **not** a leave boundary — it only clears `currentRoomCallSessionId` and unsubscribes room observers; never calls `leaveCall` or disconnects LiveKit.

## Client-side call stores

`useCallStore` (`store/message/room/call/index.ts`):

- `activeCallSessionId` — session the user is **in** (drives `leaveCall`, `setMute`, `setCamera`).
- `currentRoomCallSessionId` — session for the **viewed** room (set by `useCallSubscribables`, drives `roomParticipants` display). Reset to `""` on room leave.
- `callRoomId` — room ID of active call, kept **only** for admin action roomId checks. Empty for standalone.
- `isCallViewOpen` — controls the `Panel/Dialog.vue` fullscreen overlay in room calls.

`useParticipantStore` (`call/participant.ts`): `callSessionParticipantsMap` (`Map<callSessionId, Map<sessionId, CallParticipant>>`), `speakingIds`, `joinNoticeParticipant`.

### Call participant state — Map-based design

The client `callSessionParticipantsMap` mirrors the server structure for O(1) lookups on all participant mutations (`setMute`, `setHandRaised`, `setParticipantCamera`, `deleteCallParticipant`) without scanning arrays.

- **Don't add a separate tracking collection** for state already on `CallParticipant`. `isHandRaised` on the participant replaces any external `handRaisedIdsMap`. Check if a new field belongs on `CallParticipant` itself before adding a parallel map.
- **tRPC boundary uses `Map<string, CallParticipant>` directly** — SuperJSON natively serializes Maps. Procedures return Maps and `setParticipantMap` stores as-is. Never convert to/from arrays at the boundary.
- **Iterate in templates** with `v-for="participant of myMap.values()"`, not via array conversion. Use `.size` not `.length`.
- **Mutate through the reactive chain** — obtain a participant via `callSessionParticipantsMap.value.get(callSessionId)?.get(sessionId)`. Storing it in a local (`const participant = ...get(id)`) is fine: the object is Vue-proxied, so `participant.isMuted = true` triggers reactivity. The restriction is against capturing a _stale reference_ before the reactive lookup (e.g. closing over the map in a non-reactive context).
- **`selfParticipant` computed** — derive `isInCall`, `isMuted`, `isHandRaised` for the current session from one `computed(() => sessionId.value ? callSessionParticipantsMap.value.get(activeCallSessionId.value)?.get(sessionId.value) : undefined)` rather than per-value `.find()`/`.includes()`.
- **Never wrap raw store state in a getter for read-only access** — expose `callSessionParticipantsMap` directly via `storeToRefs` (components) or dot access (stores), and inline the guard within each consumer's reactive context. A `getParticipantMap(id)` wrapper hides tracked deps, can break reactivity when the reference escapes, and returns a new empty `Map` each call (breaking computed caching). Inline `participantStore.callSessionParticipantsMap.get(id) ?? new Map<string, CallParticipant>()` instead.

```ts
// Map-based, O(1), state on entity, reactive deps visible at the call site
// In stores (dot access on store instance):
const childMap = computed(() => entityStore.parentMap.get(parentId.value) ?? new Map<string, Entity>());
const self = computed(() => (selfId.value ? childMap.value.get(selfId.value) : undefined));
const isPresent = computed(() => Boolean(self.value));
const isActive = computed(() => self.value?.isActive ?? false);

// In components (storeToRefs):
const { parentMap } = storeToRefs(entityStore);
const childMap = computed(() => parentMap.value.get(parentId.value) ?? new Map<string, Entity>());

// template iteration
v-for="entity of childMap.values()"
```

`useMediaStore` (`call/media.ts`): `isDeafened`, `isForceMuted`, `isCameraEnabled`, `isScreenSharing`, `screenSharingParticipantIds`, `pinnedParticipantId`, `selectedVirtualBackground`, `localVideoStream`, `remoteVideoStreams`, `localScreenShareStream`, `remoteScreenShareStreams`.

`useLiveKitStore` (`store/message/room/liveKit.ts`) wraps the LiveKit `Room`: `connect`, `disconnect`, `setCamera`, `setMicrophone`, `setRemoteAudioMuted`, `setScreenShare`, `setVirtualBackground`. All track/media logic lives here; `useCallStore` delegates to it.

## Shareable call link

- `/calls` — standalone lobby; calls `createCall()` then navigates to `/calls/[id]`.
- `/calls/[id]` — full-screen standalone call; creator auto-joins via persisted `callSessionsInMessage.userId`, everyone else sees pre-join and must knock.
- `InviteCard.vue` is only shown on `/calls/[id]` (hidden when `callRoomId` is set). It copies `window.location.href` (the correct `/calls/[id]` URL in standalone context).

## Admin actions and calls

Admin action hooks in `useCallStore` receive `roomId`. Compare against `callRoomId` (not `activeCallSessionId`) since admin actions are room-scoped:

```ts
AdminActionHookMap[AdminActionType.ForceMute].push(async (roomId) => {
  if (sessionId.value) setMute(currentRoomCallSessionId.value, sessionId.value, true);
  if (callRoomId.value !== roomId) return;
  await setMicrophone(false);
  mediaStore.isForceMuted = true;
});
```

`KickFromCall` does not check `callRoomId` — it always leaves regardless of room.

## RBAC — `RoomPermission` bits

Current bit assignments (`packages/db-schema/src/schema/roomRolesInMessage.ts`):

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

`Administrator` **must** remain the highest bit. New permissions go before it, incrementing its bit (requires migration to update stored values).

## `AdminActionType` enum

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

## Knock/Admit (lobby/waiting room)

Scope: standalone calls only. Room calls stay gated by room membership/RBAC.

- `knockCall({ id })` — adds caller to `callKnockerMap`; emits `onKnockCall` to participants.
- `admitKnocker` / `dismissKnocker` — called by any participant; `admitKnocker` adds a one-time session admission in `callAdmittedParticipantMap`, then emits `onKnockerAdmitted` to the knocker.
- `/calls/[id]` states: `idle` (pre-join) → `knocking` (waiting overlay) → `joined` (full CallView).
- Creator (`callSessionsInMessage.userId`) skips straight to `joined`; everyone else must be admitted.
- `JoinNotice.vue` shows "Let In" / "Dismiss" per knocker.
