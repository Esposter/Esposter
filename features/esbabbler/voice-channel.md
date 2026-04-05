# Esbabbler — Voice Channel Architecture

## Overview

Discord-style persistent per-room voice channel. Every room has a single voice channel slot that any room member can drop into and leave freely — no separate "start a call" concept, the channel is always available.

---

## User Experience

- Each room's sidebar shows a **Voice** section beneath the message list; lists who is currently in the channel with their status avatars
- **Join Voice** button → connects microphone, adds user to the active participant list
- **Leave Voice** button → disconnects and removes user from the list
- **Mute toggle** — mic off but still present in the channel (others can see you're there)
- **Speaking indicator** — ring/pulse on avatar when audio is detected from that participant
- The room list in the main sidebar shows a small "🔊 N" badge on rooms with active voice participants

---

## Technology Choice

### v1 — Mesh WebRTC (small groups ≤ 8)

Each participant sends audio directly to every other participant (full mesh P2P). No media server needed — only a STUN/TURN server for NAT traversal.

- **STUN**: `stun.l.google.com:19302` — free, no setup
- **TURN**: Coturn self-hosted on a small VM, or a pay-as-you-go service (Twilio Network Traversal, Metered TURN) for NAT hole-punching fallback
- **Browser API**: native `RTCPeerConnection` wrapped by `simple-peer` (lightweight, well-maintained)

Mesh is appropriate for a casual platform where voice rooms will typically be 2–5 people.

### Scale path — SFU

If rooms regularly exceed ~8 participants, a Selective Forwarding Unit (SFU) eliminates the N² upload problem. Each client sends one stream to the SFU which distributes it.

Recommended options:

- **LiveKit** (self-hosted OSS or LiveKit Cloud) — best DX, native JS/Vue SDK, WebRTC-based
- **Daily.co** — fully managed, generous free tier

Recommend starting with mesh and migrating to LiveKit when needed.

---

## Signalling

WebRTC requires an out-of-band signalling channel to exchange SDP offers/answers and ICE candidates. The existing tRPC subscription infrastructure handles this.

New tRPC procedures in `server/trpc/routers/room/voice.ts`:

| Procedure            | Type         | Purpose                                                             |
| -------------------- | ------------ | ------------------------------------------------------------------- |
| `joinVoiceChannel`   | mutation     | Add caller to the room's active participant list; broadcast to room |
| `leaveVoiceChannel`  | mutation     | Remove caller from participant list; broadcast to room              |
| `sendSignal`         | mutation     | Relay SDP offer/answer or ICE candidate to a specific peer          |
| `onParticipantJoin`  | subscription | Fires for all room members when someone joins                       |
| `onParticipantLeave` | subscription | Fires for all room members when someone leaves                      |
| `onSignal`           | subscription | Delivers relayed SDP/ICE payload to the target peer                 |

The signalling flow mirrors a standard WebRTC mesh:

1. Joiner calls `joinVoiceChannel` → all existing participants receive `onParticipantJoin`
2. Each existing participant sends an SDP offer to the joiner via `sendSignal`
3. Joiner sends back SDP answers; both sides exchange ICE candidates via `sendSignal` / `onSignal`
4. Audio streams once ICE negotiation completes

---

## State Storage

Active voice participants are **ephemeral** — not persisted to Azure Table. Options:

| Approach                                           | Pros                                                 | Cons                                 |
| -------------------------------------------------- | ---------------------------------------------------- | ------------------------------------ |
| In-memory map on the server process                | Zero infra cost                                      | Lost on server restart/scale-out     |
| SignalR presence group                             | Survives restarts, works across instances            | Requires Azure SignalR Service       |
| `voiceParticipants` Azure Table with TTL heartbeat | Survives restarts, visible without being in the room | Extra writes (heartbeat every ~15 s) |

**Recommendation**: In-memory map for v1 (acceptable on a single-instance casual platform). If Azure SignalR is added for messaging, migrate presence to a SignalR group.

---

## Folder Structure

```text
packages/app/
  shared/models/room/voice/
    VoiceParticipant.ts           # extends Pick<User, "id" | "image" | "name"> & { isMuted }
    VoiceSignalType.ts            # enum VoiceSignalType + voiceSignalTypeSchema
    VoiceSignalPayload.ts         # interface + voiceSignalPayloadSchema

  server/services/message/
    events/
      voiceEventEmitter.ts        # EventEmitter for joinVoiceChannel, leaveVoiceChannel, muteChanged, signal
    voice/
      voiceParticipantMap.ts      # voiceRoomParticipantMap: Map<roomId, Map<participantId, VoiceParticipant>>
      addVoiceParticipant.ts
      deleteVoiceParticipant.ts
      getRoomParticipants.ts
      updateVoiceParticipantMute.ts

  server/trpc/routers/room/
    voice.ts                      # readVoiceParticipants, joinVoiceChannel, leaveVoiceChannel, setMute,
                                  # sendSignal, onParticipantJoin, onParticipantLeave, onMuteChanged, onSignal
    voice.test.ts                 # tRPC router tests

  app/
    store/message/
      voice.ts                    # participantsByRoom, joinVoice, leaveVoice, setMute, setParticipants
    composables/message/room/
      useVoiceChannel.ts          # join/leave, peer map, mute toggle, speaking detection, subscriptions
    components/Message/Voice/
      Panel.vue                   # sidebar panel: participant list + join/leave/mute buttons
      Participant.vue             # avatar + speaking ring + mute badge
```

---

## What Does Not Change

- Message infrastructure — voice channel is entirely separate from text messages
- Room model — no new DB columns needed; voice state is ephemeral
- Auth/permissions — existing room membership check in the room router gates `joinVoiceChannel`
- Existing tRPC subscription pattern — `onParticipantJoin` / `onSignal` follow the same shape as `onCreateMessage`

---

## Open Questions

- **Mute enforcement**: server-side mute (moderator can force-mute) vs client-side handling — recommend client-side only for v1
- **Video**: out of scope for v1; same `RTCPeerConnection` extends to video by adding a video track
- **Screen share**: out of scope; requires `getDisplayMedia()` + SFU for performance beyond 2 viewers
- **Recording**: out of scope; requires SFU with recording support (e.g. LiveKit Egress)
- **DM voice**: once Direct Messages land, DM rooms can opt into the same voice infrastructure
