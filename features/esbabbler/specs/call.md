# Esbabbler — Call & Video Channel Architecture

Discord-style persistent per-room A/V channel. Any member can join/leave freely — no "start a call" concept.
Screensharing: see [`specs/screenshare.md`](screenshare.md).

---

## User Experience

- Each room's header has a **📞 Start Call / Join Call** button (idle) or a **🟢 N in call** badge (active)
- **Join** → connects microphone + optional camera, adds user to participant list
- **Leave** → disconnects and removes user from the list
- **Navigate away** → keeps the user in the call; only the inline room observer changes
- **Mute** — mic off but still present (others see the mute badge)
- **Deafen** — stop receiving all remote audio (you are effectively deaf; others still see you)
- **Camera** — toggle local video track on/off
- **Screenshare** — see `specs/screenshare.md`
- **Speaking indicator** — ring/pulse on avatar when audio detected
- Sidebar room list: small **🔊 N** badge on rooms with active call participants (visible to non-participants)

### Layout modes

| What's active      | Layout                                                                |
| ------------------ | --------------------------------------------------------------------- |
| Audio only         | Compact horizontal strip (call panel, avatars, controls)              |
| 1+ video track     | Grid of video tiles (no screenshare: symmetric grid)                  |
| Screenshare active | Presenter view: share fills main area; participant strip along bottom |

---

## Technology

### v1 (completed) — Mesh WebRTC ≤ 8 users, audio only

Each participant sends audio directly to every other participant (N² upload). No media server needed — STUN/TURN only for NAT traversal. Appropriate for audio-only calls up to ~5 people.

### v2 (current) — LiveKit SFU

**Why migrate:**

- Mesh breaks down with video: 5 people × 3 tracks (mic, camera, screen) = 12 streams **per client**. Upload bandwidth becomes unsustainable instantly.
- Screen sharing requires a reliable media relay — mesh has no way to simulcast screen tracks efficiently.
- LiveKit OSS is already called out as the migration path in every prior spec.

**LiveKit handles:**

- All WebRTC signaling (SDP offer/answer, ICE candidates) — `sendSignal` and `onSendSignal` tRPC procedures are removed
- STUN/TURN built in (LiveKit Cloud bundles it; self-hosted: LiveKit bundles STUN, add Coturn for TURN)
- Track publication, subscription, simulcast, bandwidth estimation
- Participant events — the LiveKit `Room` object emits `participantConnected`, `trackPublished`, `trackSubscribed`, etc.

**Server keeps:**

- Participant map (`callParticipantMap`) — updated via LiveKit webhooks (participant joined/left) so non-participants see who's in the channel via tRPC subscriptions
- Token generation — `joinCall` mutation returns `{ livekitUrl, livekitToken }` which the client uses to connect

---

## Call Lifetime Boundary

Call membership is anchored to the active LiveKit participant/session, not to the currently viewed room route. Navigating from room A to room B must not be interpreted as leaving room A's call.

### Leave triggers

Only these actions remove the local participant:

- User intent: clicking **Leave Call** in room controls, call view controls, or any persistent call status control.
- Moderation intent: `KickFromCall`, `KickFromRoom`, `TimeoutUser`, or `CreateBan` when the active call belongs to the affected room.
- Session loss: logout, tab close, browser crash, or LiveKit disconnect that produces a `participant_left` webhook.
- Standalone call-route unmount: leaving `/call/[id]` because that page is the full call context.

### Non-leave transitions

These must keep the active call connected:

- Navigating to another room.
- Opening a DM, settings page, profile page, or other in-app route while the app shell remains mounted.
- Switching the inline room call observer from one `currentRoomCallSessionId` to another.
- Losing the viewed room's call subscription while still connected to LiveKit.

### Minimal client architecture

Keep one owner for media membership and one owner for room observation:

| Owner                                | Responsibility                                                                                                | Must not do                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `callStore.leaveCall()`              | The only normal client path that calls `roomCall.leaveCall`, disconnects LiveKit, and resets active state     | Run implicitly during ordinary room navigation            |
| `useCallSubscribables()`             | Observes the currently viewed room's call session and updates `currentRoomCallSessionId` / `roomParticipants` | Remove the active participant or disconnect LiveKit       |
| `useCallIdSubscribables()`           | Owns `/call/[id]` page membership; joins on mount, leaves on unmount                                          | Reuse room-navigation cleanup semantics                   |
| `StatusBar.vue` / persistent call UI | Shows the active call and links back to `callRoomId` after navigation                                         | Depend on `currentRoomCallSessionId` to decide membership |

`activeCallSessionId` answers "what call am I in?" while `currentRoomCallSessionId` answers "what call belongs to the room I am looking at?" They can be different, and that is valid.

---

## Cost Comparison

| Option                                          | Monthly cost (small community)   | Notes                                                           |
| ----------------------------------------------- | -------------------------------- | --------------------------------------------------------------- |
| **LiveKit Cloud — free tier**                   | **$0**                           | 5,000 participant-minutes/month included                        |
| **LiveKit Cloud — paid**                        | ~$1/1,000 participant-minutes    | Cheapest zero-ops option at scale                               |
| **Cloudflare Calls**                            | ~$0.05/1,000 participant-minutes | 20× cheaper at volume; more signaling custom work               |
| **Self-hosted LiveKit on Azure Container Apps** | ~$5–15/month                     | Serverless, scales to zero; most cost-efficient at scale        |
| Mesh WebRTC + video (no migration)              | $0 infra                         | Technically free but breaks at 4+ people with video; not viable |

**Recommendation:** LiveKit Cloud free tier to start → migrate to self-hosted LiveKit on Azure Container Apps when participant-minutes exceed ~10,000/month.

Self-hosted LiveKit is a single Docker image (`livekit/livekit-server`). On Azure Container Apps:

```bash
az containerapp create \
  --name livekit \
  --image livekit/livekit-server:latest \
  --ingress external --target-port 7880 \
  --min-replicas 0 --max-replicas 2 \
  --args "--config=/config/livekit.yaml"
```

Estimated: 0.25 vCPU × $0.000024/vCPU-s ≈ $5–12/month under typical community load.

---

## tRPC Procedures

All in `server/trpc/routers/room/call.ts`. Procedures are registered as `roomCall` (not `call` — reserved word).

### v1 (completed) — Mesh WebRTC + persistent call sessions

| Procedure              | Type         | Auth             | Input                        | Purpose                                                                                |
| ---------------------- | ------------ | ---------------- | ---------------------------- | -------------------------------------------------------------------------------------- |
| `readCallSession`      | query        | member           | `{ roomId }`                 | Reads `callSessionsInMessage` row; returns session `id` string (`""` if none exists)   |
| `joinCallByRoomId`     | mutation     | member           | `{ roomId }`                 | Creates session if needed; adds participant; returns `{ callSessionId, participants }` |
| `joinCall`             | mutation     | authed (no room) | `{ id }`                     | Join by shareable 12-char id — no room membership required                             |
| `leaveCall`            | mutation     | authed (no room) | `{ callSessionId }`          | Removes participant; on last leaver writes `MessageType.Call` system message           |
| `readCallParticipants` | query        | authed (no room) | `{ callSessionId }`          | Returns current participant list (initial load, non-participants)                      |
| `setMute`              | mutation     | authed (no room) | `{ callSessionId, isMuted }` | Syncs muted state; broadcasts `onSetMute`                                              |
| `sendSignal`           | mutation     | authed (no room) | `{ callSessionId, payload }` | Sends WebRTC signaling payload to target participant                                   |
| `onJoinCall`           | subscription | authed (no room) | `callSessionId` (12-char)    | Fires when a participant joins                                                         |
| `onLeaveCall`          | subscription | authed (no room) | `callSessionId` (12-char)    | Fires when a participant leaves                                                        |
| `onSetMute`            | subscription | authed (no room) | `callSessionId` (12-char)    | Fires on mute toggle                                                                   |
| `onSendSignal`         | subscription | authed (no room) | `callSessionId` (12-char)    | Fires when a signal is sent to this session                                            |

`requireCallSession(db, callSessionId)` — internal helper used by subscriptions; throws NOT_FOUND if session doesn't exist (guards against guessing).

### Design decisions

**`CallParticipant.id` is `session.id`, not `user.id`**

Each WebRTC peer connection IS an auth session. `sendSignal` routes to a specific `session.id` peer — you can't signal "to a user" in a mesh, you signal to a specific connection. Two devices = two separate WebRTC peers = two separate participant map entries = correct behavior. Using `user.id` would cause last-write-wins on multi-device join and make `leaveCall` on device A evict device B's entry.

`CallParticipant` already stores `userId` for UI display. The `deviceId` composite (userId + sessionId) adds no value here — `session.id` is already globally unique per device.

**This does NOT change for v2 (LiveKit).** The LiveKit `AccessToken` uses `identity: session.id` — LiveKit's participant identity maps 1:1 to the auth session. The webhook-driven `callParticipantMap` updates use the same `session.id` key. Multi-device: each device gets its own LiveKit participant (separate tracks, separate mute state) which is the correct model.

### v2 (current) — LiveKit migration

| Procedure              | Type             | Change from v1 | Purpose                                                                                                                  |
| ---------------------- | ---------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `joinCall`             | mutation         | **Modified**   | Generates LiveKit token + creates room if needed; updates server participant map; returns `{ livekitUrl, livekitToken }` |
| `leaveCall`            | mutation         | Kept           | Removes from server participant map; broadcasts leave (webhook also does this as backup)                                 |
| `readCallParticipants` | query            | Kept           | Returns current participant list (initial load, non-participants)                                                        |
| `setMute`              | mutation         | Kept           | Syncs muted state to server map; broadcasts `onSetMute`                                                                  |
| ~~`sendSignal`~~       | ~~mutation~~     | **Removed**    | LiveKit handles signaling internally                                                                                     |
| ~~`onSendSignal`~~     | ~~subscription~~ | **Removed**    | LiveKit handles signaling internally                                                                                     |
| `onJoinCall`           | subscription     | Kept           | Fires when participant joins (driven by webhook or `joinCall`)                                                           |
| `onLeaveCall`          | subscription     | Kept           | Fires when participant leaves                                                                                            |
| `onSetMute`            | subscription     | Kept           | Fires on mute toggle                                                                                                     |
| `onVideoChanged`       | subscription     | **New**        | Fires when camera on/off state changes                                                                                   |

### Token generation (server)

```typescript
import { AccessToken } from "livekit-server-sdk";

const token = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
  identity: session.id,
  name: session.user.name,
});
token.addGrant({
  roomJoin: true,
  room: roomId,
  canPublish: true,
  canSubscribe: true,
  canPublishSources: ["microphone", "camera", "screen_share", "screen_share_audio"],
});
return { livekitUrl: env.LIVEKIT_URL, livekitToken: await token.toJwt() };
```

---

## Client Architecture

### Media bridge: `store/message/room/liveKit.ts`

Replaces all `RTCPeerConnection` / ICE candidate logic with a LiveKit `Room`.

```typescript
import { Room, RoomEvent, Track } from "livekit-client";

const room = new Room({ adaptiveStream: true, dynacast: true });

async function join() {
  const { livekitUrl, livekitToken } = await $trpc.roomCall.joinCallByRoomId.mutate({ roomId });
  await room.connect(livekitUrl, livekitToken);
  await room.localParticipant.setMicrophoneEnabled(true);
  // bind events → update store
  room.on(RoomEvent.ParticipantConnected, onParticipantJoin);
  room.on(RoomEvent.ParticipantDisconnected, onParticipantLeave);
  room.on(RoomEvent.TrackPublished, onTrackPublished);
}

async function leave() {
  await room.disconnect();
  await $trpc.roomCall.leaveCall.mutate({ callSessionId });
}

async function toggleMute() {
  await room.localParticipant.setMicrophoneEnabled(!isEnabled);
  await $trpc.roomCall.setMute.mutate({ callSessionId, isMuted: !isEnabled });
}

async function toggleCamera() {
  await room.localParticipant.setCameraEnabled(!isCameraEnabled);
  // broadcasts via onVideoChanged
}

async function toggleDeafen() {
  // mute all remote audio track subscriptions
  room.remoteParticipants.forEach((p) => p.audioTrackPublications.forEach((pub) => pub.setSubscribed(!isDeafened)));
  callStore.setDeafened(!isDeafened);
}
```

The call store exposes `{ joinCall, joinCallByRoomId, leaveCall, toggleMute, toggleCamera, toggleDeafen }`; LiveKit-specific track handling stays in `liveKit.ts`.

`leaveCall` is an explicit membership action, not route cleanup. Room-level subscription cleanup should unsubscribe observers and clear viewed-room state only.

### State — Pinia Store (`store/message/room/call.ts`)

#### v1 (current)

| State                        | Kind       | Description                                                                   |
| ---------------------------- | ---------- | ----------------------------------------------------------------------------- |
| `callSessionParticipantsMap` | `ref`      | `Map<callSessionId, CallParticipant[]>` — keyed by session UUID, not roomId   |
| `activeCallSessionId`        | `ref`      | Session the user is **in** — drives `leaveCall`, `setMute`, `setCamera`       |
| `currentRoomCallSessionId`   | `ref`      | Session for the **viewed** room — set by `useCallSubscribables` on room enter |
| `callRoomId`                 | `ref`      | Room ID of active call — kept only for admin action room-scoped checks        |
| `speakingIds`                | `ref`      | Session IDs currently speaking (AudioContext analysis)                        |
| `isInCall`                   | `computed` | Derived: active participant list contains current sessionId                   |
| `isMuted`                    | `computed` | Derived from active participant list                                          |
| `isDeafened`                 | `ref`      | Local only — not broadcast                                                    |
| `isForceMuted`               | `ref`      | Set by admin ForceMute action                                                 |
| `roomParticipants`           | `computed` | Participants in currently viewed room (from `currentRoomCallSessionId`)       |

#### v2 (additions for LiveKit)

| State                          | Kind  | Description                          |
| ------------------------------ | ----- | ------------------------------------ |
| `isCameraEnabled`              | `ref` | Local camera state                   |
| `isScreenSharing`              | `ref` | Local screenshare state              |
| `screenSharingParticipantSids` | `ref` | SIDs of participants sharing screen  |
| `pinnedParticipantSid`         | `ref` | Pinned presenter in screenshare view |

### Models

```
shared/models/room/call/
  CallParticipant.ts         # { id: sessionId, userId, name, image, isMuted, isCameraEnabled }
  CallTrackType.ts           # enum: Microphone | Camera | ScreenShare | ScreenShareAudio
```

---

## Architectural Diagram

### Join flow (LiveKit)

```text
Client A (joining)               Server (tRPC)            LiveKit SFU         Client B (in room)
        |                              |                        |                      |
        |-- joinCall ----------------->|                        |                      |
        |                              |-- createRoom (if new) ->|                      |
        |                              |-- generate token -------|                      |
        |<-- { livekitUrl, token } ----|                        |                      |
        |-- room.connect(url, token) -------------------------->|                      |
        |                              |          [participant joined webhook]          |
        |                              |<-- webhook: participantJoined -----------------|
        |                              |-- callEventEmitter.emit("joinCall") -------->|
        |                              |                (onJoinCall sub)               |
        |<========= audio/video tracks flow through LiveKit SFU =====================>|
```

### Non-participant observer

```text
Non-participant client          Server (tRPC)
        |                              |
        |-- readCallParticipants ----->| (initial load)
        |<-- [participant list] --------|
        |-- subscribe onJoinCall/onLeaveCall                    |
        |<-- events from callEventEmitter (webhook-driven) -----|
```

---

## LiveKit Webhook Setup

LiveKit calls a webhook on participant events. Add a Nuxt server route:

```
server/api/webhooks/livekit.post.ts
```

Validates the `Authorization` header with `WebhookReceiver` from `livekit-server-sdk`, then:

- `participant_joined` → `createCallParticipant` + `callEventEmitter.emit("joinCall")`
- `participant_left` → `deleteCallParticipant` + `callEventEmitter.emit("leaveCall")`

This is the backup for clients that disconnect without calling `leaveCall` (browser tab crash, network drop).

LiveKit webhooks should be the backup for real media/session loss, not the primary path for in-app route changes. Route changes inside the Nuxt app must keep the LiveKit room connected unless an explicit leave trigger fires.

---

## Folder Structure

```text
packages/app/
  shared/models/room/call/
    CallParticipant.ts
    CallTrackType.ts                     # new — replaces CallSignalType
    CallSignalPayload.ts                 # DELETED (LiveKit handles signaling)

  server/
    api/webhooks/
      livekit.post.ts                    # new — webhook receiver
    services/message/
      events/
        callEventEmitter.ts              # app-level tRPC observer bridge
      call/
        callParticipantMap.ts            # unchanged
        createCallParticipant.ts         # unchanged
        deleteCallParticipant.ts         # unchanged
        getCallParticipants.ts           # unchanged
        updateCallParticipantMute.ts     # unchanged
    trpc/routers/room/
      call.ts                            # joinCall returns token; remove sendSignal/onSendSignal; add onVideoChanged

  app/
    store/message/room/
      call.ts                            # add: isDeafened, isCameraEnabled, isScreenSharing
      liveKit.ts                         # LiveKit Room replaces RTCPeerConnection peer map
    components/Message/
      Content/
        CallButton.vue                   # unchanged UX; reads token from joinCall
        CallPanel.vue                    # add camera toggle, deafen toggle, screenshare button
        CallParticipant.vue              # add video tile when camera enabled
```

## What Does Not Change

Message infrastructure, room model, auth/RBAC, the join/leave/mute tRPC subscription pattern, `callParticipantMap` server-side storage, `CallPanel.vue` outer layout, `StatusBar.vue` in-call indicator.
