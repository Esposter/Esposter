---
name: esbabbler-call
description: Esposter messaging calls (esbabbler) implementation — the persistent callSessionsInMessage row plus the ephemeral in-memory participant/admission/start-time maps, short random codes always being the row's id (never a token/code column) via createId, standalone vs room calls and which join procedure each uses, the call session lifecycle from readCallSessionId to the duration system message, the four leave boundaries (and room navigation not being one), and which of useCallStore / useParticipantStore / useMediaStore / useLiveKitStore owns each piece of client state — plus deep dives on the Map-based participant state rules, RoomPermission bits and AdminActionType with the admin-action hooks, and the standalone /calls surface with its knock/admit lobby. Apply when working on calls (store/message/room/call/, liveKit.ts, callSession routers, /calls pages).
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

## Random id terminology

Short random codes are always the row's `id` — never a separate `token`/`code` column:

- `invitesInMessage.id` (`INVITE_ID_LENGTH` = 8) — the invite link code
- `callSessionsInMessage.id` (`CALL_ID_LENGTH` = 12) — the shareable call/meeting link
- `createId(length)` from `#shared/util/math/random/createId` — the single generator (uses `crypto.getRandomValues`)

Never use `token`, `code`, `createToken`, `createCode`, or `*_TOKEN_LENGTH` — old names, deleted.

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
4. **Subscriptions** (`onJoinCall`, `onLeaveCall`, `onSetCamera`, `onSetHandRaised`, `onSetMute`) take `callSessionId` (not `roomId`); auth only — the caller must have obtained the `callSessionId` through an authenticated call.
5. **Leave**: `leaveCall({ callSessionId })`. Throws `NOT_FOUND` if the caller is not a participant. On the last participant leaving: writes the call duration as a `MessageType.Call` system message to the room.

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
- `callRoomId` — room ID of the active call, kept **only** for admin action roomId checks. Empty for standalone.
- `isCallViewOpen` — controls the `Panel/Dialog.vue` fullscreen overlay in room calls.

`useParticipantStore` (`call/participant.ts`): `callSessionParticipantsMap` (`Map<callSessionId, Map<sessionId, CallParticipant>>`), `speakingIds`, `joinNoticeParticipant`.

`useMediaStore` (`call/media.ts`): `isDeafened`, `isForceMuted`, `isCameraEnabled`, `isPoppedOut`, `isScreenSharing`, `screenSharingParticipantIds`, `pinnedParticipantId`, `participantVolumePercentageMap`, `selectedVirtualBackground`, `localVideoStream`, `remoteVideoStreams`, `localScreenShareStream`, `remoteScreenShareStreams`.

`useLiveKitStore` (`store/message/room/liveKit.ts`) wraps the LiveKit `Room`: `connect`, `disconnect`, `setCamera`, `setMicrophone`, `setRemoteAudioMuted`, `setScreenShare`, `setVirtualBackground`, `setActiveDevice`. All track/media logic lives here; `useCallStore` delegates to it. Device selection is sourced from the persisted `useVoiceDeviceSettingsStore` (single source of truth) — `setActiveDevice` writes that store and per-kind watchers call `room.switchActiveDevice` to restart the live track. The store keeps no `selectedAudioInputDeviceId`-style refs. See `packages/app/content/docs/esbabbler/voice-video.md` (Device selection).

## Deep Dives

- `references/participant-state.md` — when reading, iterating or mutating call participants on the client, or adding a field that describes one.
- `references/permissions-and-admin-actions.md` — when adding a `RoomPermission` bit or an `AdminActionType`, or wiring an admin action hook into the call stores.
- `references/standalone-lobby.md` — when working on `/calls` or `/calls/[id]`: the shareable link, pre-join states, and knock/admit.
