# Esbabbler — Voice & Video Channel Architecture

Discord-style persistent per-room A/V channel. Any member can join/leave freely — no "start a call" concept.
Screensharing: see [`specs/screenshare.md`](screenshare.md).

---

## User Experience

- Each room's header has a **📞 Start Call / Join Call** button (idle) or a **🟢 N in call** badge (active)
- **Join** → connects microphone + optional camera, adds user to participant list
- **Leave** → disconnects and removes user from the list
- **Mute** — mic off but still present (others see the mute badge)
- **Deafen** — stop receiving all remote audio (you are effectively deaf; others still see you)
- **Camera** — toggle local video track on/off
- **Screenshare** — see `specs/screenshare.md`
- **Speaking indicator** — ring/pulse on avatar when audio detected
- Sidebar room list: small **🔊 N** badge on rooms with active voice participants (visible to non-participants)

### Layout modes

| What's active      | Layout                                                                |
| ------------------ | --------------------------------------------------------------------- |
| Audio only         | Compact horizontal strip (voice panel, avatars, controls)             |
| 1+ video track     | Grid of video tiles (no screenshare: symmetric grid)                  |
| Screenshare active | Presenter view: share fills main area; participant strip along bottom |

---

## Technology

### v1 (current) — Mesh WebRTC ≤ 8 users, audio only

Each participant sends audio directly to every other participant (N² upload). No media server needed — STUN/TURN only for NAT traversal. Appropriate for voice-only rooms up to ~5 people.

### v2 (next) — LiveKit SFU

**Why migrate:**

- Mesh breaks down with video: 5 people × 3 tracks (mic, camera, screen) = 12 streams **per client**. Upload bandwidth becomes unsustainable instantly.
- Screen sharing requires a reliable media relay — mesh has no way to simulcast screen tracks efficiently.
- LiveKit OSS is already called out as the migration path in every prior spec.

**LiveKit handles:**

- All WebRTC signaling (SDP offer/answer, ICE candidates) — `sendSignal` and `onSignal` tRPC procedures are removed
- STUN/TURN built in (LiveKit Cloud bundles it; self-hosted: LiveKit bundles STUN, add Coturn for TURN)
- Track publication, subscription, simulcast, bandwidth estimation
- Participant events — the LiveKit `Room` object emits `participantConnected`, `trackPublished`, `trackSubscribed`, etc.

**Server keeps:**

- Participant map (`voiceRoomParticipantMap`) — updated via LiveKit webhooks (participant joined/left) so non-participants see who's in the channel via tRPC subscriptions
- Token generation — `joinVoiceChannel` mutation returns `{ livekitUrl, livekitToken }` which the client uses to connect

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

All in `server/trpc/routers/room/voice.ts`.

| Procedure               | Type             | Change from v1 | Purpose                                                                                                                  |
| ----------------------- | ---------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `joinVoiceChannel`      | mutation         | **Modified**   | Generates LiveKit token + creates room if needed; updates server participant map; returns `{ livekitUrl, livekitToken }` |
| `leaveVoiceChannel`     | mutation         | Kept           | Removes from server participant map; broadcasts leave (webhook also does this as backup)                                 |
| `readVoiceParticipants` | query            | Kept           | Returns current participant list (initial load, non-participants)                                                        |
| `setMute`               | mutation         | Kept           | Syncs muted state to server map; broadcasts `onMuteChanged`                                                              |
| ~~`sendSignal`~~        | ~~mutation~~     | **Removed**    | LiveKit handles signaling internally                                                                                     |
| ~~`onSignal`~~          | ~~subscription~~ | **Removed**    | LiveKit handles signaling internally                                                                                     |
| `onParticipantJoin`     | subscription     | Kept           | Fires when participant joins (driven by webhook or `joinVoiceChannel`)                                                   |
| `onParticipantLeave`    | subscription     | Kept           | Fires when participant leaves                                                                                            |
| `onMuteChanged`         | subscription     | Kept           | Fires on mute toggle                                                                                                     |
| `onVideoChanged`        | subscription     | **New**        | Fires when camera on/off state changes                                                                                   |

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

### Composable: `useVoiceChannel.ts`

Replaces all `RTCPeerConnection` / ICE candidate logic with a LiveKit `Room`.

```typescript
import { Room, RoomEvent, Track } from "@livekit/client";

const room = new Room({ adaptiveStream: true, dynacast: true });

async function join() {
  const { livekitUrl, livekitToken } = await $trpc.room.voice.joinVoiceChannel.mutate({ roomId });
  await room.connect(livekitUrl, livekitToken);
  await room.localParticipant.setMicrophoneEnabled(true);
  // bind events → update store
  room.on(RoomEvent.ParticipantConnected, onParticipantJoin);
  room.on(RoomEvent.ParticipantDisconnected, onParticipantLeave);
  room.on(RoomEvent.TrackPublished, onTrackPublished);
}

async function leave() {
  await room.disconnect();
  await $trpc.room.voice.leaveVoiceChannel.mutate({ roomId });
}

async function toggleMute() {
  await room.localParticipant.setMicrophoneEnabled(!isEnabled);
  await $trpc.room.voice.setMute.mutate({ roomId, isMuted: !isEnabled });
}

async function toggleCamera() {
  await room.localParticipant.setCameraEnabled(!isCameraEnabled);
  // broadcasts via onVideoChanged
}

async function toggleDeafen() {
  // mute all remote audio track subscriptions
  room.remoteParticipants.forEach((p) => p.audioTrackPublications.forEach((pub) => pub.setSubscribed(!isDeafened)));
  voiceStore.setDeafened(!isDeafened);
}
```

Exposes: `{ join, leave, toggleMute, toggleCamera, toggleDeafen, startScreenShare, stopScreenShare }`. State lives in the store.

### State — Pinia Store (`store/message/voice.ts`)

| State                      | Kind       | Description                                            |
| -------------------------- | ---------- | ------------------------------------------------------ |
| `voiceParticipantsRoomMap` | `ref`      | `Map<roomId, VoiceParticipant[]>`                      |
| `speakingIds`              | `ref`      | Session IDs currently speaking (AudioContext analysis) |
| `isInChannel`              | `computed` | Derived from participant map + current session         |
| `isMuted`                  | `computed` | Derived from participant map                           |
| `isDeafened`               | `ref`      | Local only — not broadcast to others                   |
| `isCameraEnabled`          | `ref`      | Local camera state                                     |
| `isScreenSharing`          | `ref`      | Local screenshare state                                |

### Models

```
shared/models/room/voice/
  VoiceParticipant.ts        # { id: sessionId, userId, name, image, isMuted, isCameraEnabled }
  VoiceTrackType.ts          # enum: Microphone | Camera | ScreenShare | ScreenShareAudio
```

---

## Architectural Diagram

### Join flow (LiveKit)

```text
Client A (joining)               Server (tRPC)            LiveKit SFU         Client B (in room)
        |                              |                        |                      |
        |-- joinVoiceChannel --------->|                        |                      |
        |                              |-- createRoom (if new) ->|                      |
        |                              |-- generate token -------|                      |
        |<-- { livekitUrl, token } ----|                        |                      |
        |-- room.connect(url, token) -------------------------->|                      |
        |                              |          [participant joined webhook]          |
        |                              |<-- webhook: participantJoined -----------------|
        |                              |-- voiceEventEmitter.emit("join") ------------>|
        |                              |                (onParticipantJoin sub)        |
        |<========= audio/video tracks flow through LiveKit SFU =====================>|
```

### Non-participant observer

```text
Non-participant client          Server (tRPC)
        |                              |
        |-- readVoiceParticipants ---->| (initial load)
        |<-- [participant list] --------|
        |-- subscribe onParticipantJoin/Leave                  |
        |<-- events from voiceEventEmitter (webhook-driven) ----|
```

---

## LiveKit Webhook Setup

LiveKit calls a webhook on participant events. Add a Nuxt server route:

```
server/api/webhooks/livekit.post.ts
```

Validates the `Authorization` header with `WebhookReceiver` from `livekit-server-sdk`, then:

- `participant_joined` → `createVoiceParticipant` + `voiceEventEmitter.emit("joinVoiceChannel")`
- `participant_left` → `deleteVoiceParticipant` + `voiceEventEmitter.emit("leaveVoiceChannel")`

This is the backup for clients that disconnect without calling `leaveVoiceChannel` (browser tab crash, network drop).

---

## Folder Structure

```text
packages/app/
  shared/models/room/voice/
    VoiceParticipant.ts
    VoiceTrackType.ts                    # new — replaces VoiceSignalType
    VoiceSignalPayload.ts                # DELETED (LiveKit handles signaling)

  server/
    api/webhooks/
      livekit.post.ts                    # new — webhook receiver
    services/message/
      events/
        voiceEventEmitter.ts             # unchanged
      voice/
        voiceParticipantMap.ts           # unchanged
        createVoiceParticipant.ts        # unchanged
        deleteVoiceParticipant.ts        # unchanged
        getRoomParticipants.ts           # unchanged
        updateVoiceParticipantMute.ts    # unchanged
    trpc/routers/room/
      voice.ts                           # modified: joinVoiceChannel returns token; remove sendSignal/onSignal; add onVideoChanged

  app/
    store/message/
      voice.ts                           # add: isDeafened, isCameraEnabled, isScreenSharing
    composables/message/room/
      useVoiceChannel.ts                 # rewrite: LiveKit Room replaces RTCPeerConnection peer map
    components/Message/
      Content/
        VoiceCallButton.vue              # unchanged UX; reads token from joinVoiceChannel
        VoicePanel.vue                   # add camera toggle, deafen toggle, screenshare button
        VoiceParticipant.vue             # add video tile when camera enabled
```

## What Does Not Change

Message infrastructure, room model, auth/RBAC, the join/leave/mute tRPC subscription pattern, `voiceParticipantMap` server-side storage, `VoicePanel.vue` outer layout, `StatusBar.vue` in-call indicator.
