# Call View UI — Standalone Call Page & Reusable Call Component

Full-screen call experience for `/call/[token]`. Components are shared with the future inline room call view (Phase 3+).

---

## Layout

### v1 — Audio only (current)

```
┌─────────────────────────────────────────────────────────┐  bg-black, h-screen, layout: false
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  ← auto-fit CSS grid
│  │              │  │              │  │              │  │    grid-template-columns:
│  │    Avatar    │  │    Avatar    │  │    Avatar    │  │    repeat(auto-fit, minmax(240px, 1fr))
│  │              │  │              │  │              │  │
│  │  Name 🔇     │  │  Name ◉     │  │  Name        │  │  ← speaking ring (◉ animated green outline)
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│         ┌────────────────────────────────┐              │  ← absolute bottom center
│         │   🎤    │    🎧    │    📞     │              │    translucent pill
│         └────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

Grid tile: `aspect-video` (16:9), dark `bg-grey-darken-4`. Avatar centered. Name + badges bottom-left.

Grid distributes automatically: 1 → full width centered; 2 → 2-col; 4 → 2×2; 6 → 3×2; etc.

### v2 — Camera tracks (Phase 3)

Same `CallView` — replace avatar fallback with `<video>` element when camera track is available.

### v3 — Screenshare (Phase 4)

Switch `CallView` to presenter layout: screenshare fills main area, participant strip along bottom. See `specs/screenshare.md`.

---

## Component Tree

```
pages/call/[token].vue                     layout: false (fullscreen)
  └── Call/View.vue                        fills h-screen, reads from store
        ├── Call/ParticipantTile.vue        one tile per participant
        └── Call/ControlBar.vue            bottom-center overlaid controls

(future Phase 3) Message/Content/Index.vue
  └── Call/View.vue                        reused inline, replaces CallPanel when video enabled
```

---

## Components

### `Call/View.vue`

- Black (`bg-black`) full-screen flex column
- Participant grid: `auto-fit` CSS grid with `pb-24` padding so bottom row clears the control bar
- Reads `callParticipants` (active call session, not room-viewed), `speakingIds`, `isDeafened`, `sessionId` from store
- Absolutely positioned `CallControlBar` at bottom

### `Call/ParticipantTile.vue`

Props: `participant: CallParticipant`, `isSelf: boolean`, `isSpeaking: boolean`, `isDeafened: boolean`

- `aspect-video` dark tile, rounded corners
- Circular `StyledAvatar` centered (size 96px)
- Speaking ring: animated green `outline` when `isSpeaking`
- Bottom-left: name label + mute badge (`mdi-microphone-off` when `participant.isMuted`)
- Self-only deafened badge (`mdi-headphones-off` when `isDeafened`)

### `Call/ControlBar.vue`

- Centered bottom row, translucent pill (`bg-grey-darken-4/90`)
- Reuses existing `useCallControlItems()` — mute toggle, deafen toggle, leave (red)

---

## Data Flow

### Token join path

```
/call/[token]
  → useCallTokenSubscribables(token)          composable handles full lifecycle
    → store.joinCallByToken(token)
      → acquireLocalStream()                  mic permission
      → $trpc.roomCall.joinCallByToken.mutate({ token })
      → activeCallSessionId.value = callSessionId
      → subscribeToSignals(callSessionId)     WebRTC signals
      → setParticipants(callSessionId, participants)
      → setupSpeakingDetection(...)
      → return callSessionId
    → subscribe onJoinCall / onLeaveCall / onSetMute (callSessionId)
  → <CallView />                              reads callParticipants from store
```

### Cleanup (page unmount)

```
onUnmounted in useCallTokenSubscribables
  → participantJoin/Leave/MuteChanged.unsubscribe()
  → store.leaveCall()
    → $trpc.roomCall.leaveCall.mutate({ callSessionId })
    → cleanupAll() (WebRTC peer connections + local stream)
    → reset activeCallSessionId, isDeafened, isForceMuted
```

---

## Differences from Room Call

| Aspect                     | Room call (`useCallSubscribables`)       | Token call (`useCallTokenSubscribables`)   |
| -------------------------- | ---------------------------------------- | ------------------------------------------ |
| Entry procedure            | `readCallSession({ roomId })` then join  | `joinCallByToken({ token })` directly      |
| `callRoomId`               | Set (enables admin action room checks)   | Not set (no room membership)               |
| `currentRoomCallSessionId` | Set (non-participant observer view)      | Not set                                    |
| Component reads            | `roomParticipants` in `CallPanel`        | `callParticipants` in `CallView`           |
| Layout                     | Compact strip inside messages view       | Full-screen (`layout: false`)              |
| Admin moderation actions   | Available (ForceMute, KickFromCall etc.) | Not available (no room membership check)   |
| Signal subscriptions       | `subscribeToSignals` via `joinCall`      | `subscribeToSignals` via `joinCallByToken` |
