# Esbabbler — Voice Channel Architecture

Discord-style persistent per-room voice channel. Any member can join/leave freely — no "start a call" concept.

## User Experience

- Each room's sidebar shows a **Voice** section beneath the message list; lists who is currently in the channel with their status avatars
- **Join Voice** button → connects microphone, adds user to the active participant list
- **Leave Voice** button → disconnects and removes user from the list
- **Mute toggle** — mic off but still present in the channel (others can see you're there)
- **Speaking indicator** — ring/pulse on avatar when audio is detected from that participant
- The room list in the main sidebar shows a small "🔊 N" badge on rooms with active voice participants

## Technology Choice

### v1 — Mesh WebRTC (small groups ≤ 8)

Each participant sends audio directly to every other participant (full mesh P2P). No media server needed — only a STUN/TURN server for NAT traversal.

- **STUN**: `stun.l.google.com:19302` — free, no setup
- **TURN**: Coturn self-hosted on a small VM, or a pay-as-you-go service (Twilio Network Traversal, Metered TURN) for NAT hole-punching fallback
- **Browser API**: native `RTCPeerConnection`

Mesh is appropriate for a casual platform where voice rooms will typically be 2–5 people.

### Scale path — SFU

If rooms regularly exceed ~8 participants, a Selective Forwarding Unit (SFU) eliminates the N² upload problem. Each client sends one stream to the SFU which distributes it.

Recommended options:

- **LiveKit** (self-hosted OSS or LiveKit Cloud) — best DX, native JS/Vue SDK, WebRTC-based
- **Daily.co** — fully managed, generous free tier

Recommend starting with mesh and migrating to LiveKit when needed.

## tRPC Procedures

All procedures live in `server/trpc/routers/room/voice.ts`.

| Procedure               | Type         | Purpose                                                                 |
| ----------------------- | ------------ | ----------------------------------------------------------------------- |
| `readVoiceParticipants` | query        | Return current participant list for a room (used on initial load)       |
| `joinVoiceChannel`      | mutation     | Add caller to the room's active participant list; always broadcast join |
| `leaveVoiceChannel`     | mutation     | Remove caller from participant list; broadcast leave                    |
| `setMute`               | mutation     | Toggle caller's muted state; broadcast mute change                      |
| `sendSignal`            | mutation     | Relay SDP offer/answer or ICE candidate to a specific peer              |
| `onParticipantJoin`     | subscription | Fires for all room members (except self) when someone joins or rejoins  |
| `onParticipantLeave`    | subscription | Fires for all room members (except self) when someone leaves            |
| `onMuteChanged`         | subscription | Fires for all room members when a participant's muted state changes     |
| `onSignal`              | subscription | Delivers relayed SDP/ICE payload to the target peer                     |

## Architectural Diagram

### Initial join

```text
Client A (joining)                  Server                  Client B (already in)
        |                              |                              |
        |-- joinVoiceChannel --------->|                              |
        |                              |-- onParticipantJoin -------->|
        |<-- [participant list] --------|                              |
        |                              |             createPeerConnection(A)
        |                              |                              |
        |<-- onSignal (offer) ---------|<-- sendSignal (offer) -------|
        |-- sendSignal (answer) ------>|-- onSignal (answer) -------->|
        |<-- onSignal (candidate) -----|<-- sendSignal (candidate) ---|
        |-- sendSignal (candidate) --->|-- onSignal (candidate) ----->|
        |                              |                              |
        |========= audio stream (P2P, bypasses server) =============|
```

### Mute toggle

```text
Client A                            Server                  Client B
   |-- setMute(isMuted) ----------->|                              |
   |  [store.setMute optimistic]    |-- onMuteChanged ------------>|
   |                                |               [store.setMute]
```

### Page refresh / reconnect

```text
Client A (refreshing)              Server                   Client B (in channel)
        |                              |                              |
        | [useOnlineSubscribable fires]|                              |
        |-- readVoiceParticipants ---->|                              |
        |<-- [list includes A] --------|                              |
        | [isInChannel=true detected]  |                              |
        | [leaveVoice locally]         |                              |
        | [isInChannel resets false]   |                              |
        |-- joinVoiceChannel --------->|                              |
        |                              |-- onParticipantJoin -------->|
        |<-- [participant list] --------|       [cleanupPeer(A)]      |
        |                              |       createPeerConnection(A)|
        |<-- onSignal (offer) ---------|<-- sendSignal (offer) -------|
        |       (full WebRTC           |       (full WebRTC           |
        |        handshake...)         |        handshake...)         |
        |========= audio stream (P2P, bypasses server) =============|
```

**Key design decisions:**

- `joinVoiceChannel` always emits the event (no `isAlreadyJoined` skip) so peers always reconnect on rejoin
- `onParticipantJoin` handler calls `cleanupPeer` before `createPeerConnection` to safely replace stale connections
- `isInChannel` and `isMuted` are **derived computeds** in the Pinia store (not tracked refs), computed from `voiceParticipantsRoomMap + currentRoomId + session.id` — naturally correct after any `setParticipants` call and survive component re-mounts

## Signalling Flow Detail

1. **On room enter** (`useOnlineSubscribable`): `readVoiceParticipants` populates the store for all observers
2. **On join**: subscribe to `onSignal` first (to catch offers from existing peers), then `joinVoiceChannel.mutate()` — server always emits join event; existing peers receive it, clean up any stale connection, and send a new offer
3. **On leave**: call `leaveVoiceChannel`, cleanup all peer connections, stop local stream, unsubscribe from `onSignal`
4. **On refresh/reconnect**: `readVoiceParticipants` detects stale server membership → `leaveVoice` locally (resets computed) → `join()` re-establishes everything

## State — Pinia Store (`store/message/voice.ts`)

| State                      | Kind       | Description                                                          |
| -------------------------- | ---------- | -------------------------------------------------------------------- |
| `voiceParticipantsRoomMap` | `ref`      | `Map<roomId, VoiceParticipant[]>` — source of truth for participants |
| `speakingIds`              | `ref`      | Session IDs currently detected as speaking (via `AudioContext`)      |
| `isInChannel`              | `computed` | Derived: current session ID present in current room's participants   |
| `isMuted`                  | `computed` | Derived: current participant's `isMuted` flag from the map           |

## Folder Structure

```text
packages/app/
  shared/models/room/voice/
    VoiceParticipant.ts           # { id: sessionId, userId, name, image, isMuted }
    VoiceSignalType.ts            # enum: Offer | Answer | Candidate
    VoiceSignalPayload.ts         # { type, targetId, data: string (JSON) }

  server/services/message/
    events/
      voiceEventEmitter.ts        # EventEmitter: joinVoiceChannel, leaveVoiceChannel, muteChanged, signal
    voice/
      voiceParticipantMap.ts      # voiceRoomParticipantMap: Map<roomId, Map<sessionId, VoiceParticipant>>
      createVoiceParticipant.ts
      deleteVoiceParticipant.ts
      getRoomParticipants.ts
      updateVoiceParticipantMute.ts

  server/trpc/routers/room/
    voice.ts                      # all 9 procedures (see table above)
    voice.test.ts

  app/
    store/message/
      voice.ts                    # voiceParticipantsRoomMap, isInChannel (computed), isMuted (computed),
                                  # joinVoice, leaveVoice, setMute, setParticipants, speakers
    composables/message/room/
      useVoiceChannel.ts          # join/leave/toggleMute, peer map, speaking detection, subscriptions
                                  # exposes: { join, leave, toggleMute } only — state via store
    components/Message/Voice/
      Panel.vue                   # sidebar panel: join/leave/mute buttons + participant list
      ParticipantList.vue         # renders participants from store
      Participant.vue             # avatar + speaking ring + mute badge
```

## What Does Not Change

Message infrastructure, room model (no new DB columns; voice state is ephemeral), auth/permissions, tRPC subscription pattern.
