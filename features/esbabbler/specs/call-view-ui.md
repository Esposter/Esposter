# Call View UI — Standalone Call Page & Reusable Call Component

Full-screen call experience for `/calls/[id]`, with `/calls` as the standalone call lobby/start page. Components are shared with the inline room call view.

---

## Layout

### v1 — Audio only (current)

```text
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

### v2 — Camera tracks

Same `CallView` — replace avatar fallback with `<video>` element when camera track is available.

### v3 — Screenshare

Switch `CallView` to presenter layout: screenshare fills main area, participant strip along bottom. See `specs/screenshare.md`.

---

## Component Tree

```text
pages/calls/index.vue                      call lobby/start page
pages/calls/[id].vue                       fullscreen call route
  └── Call/View.vue                        fills h-screen, reads from store
        ├── Call/Participant/Tile.vue       one tile per participant
        ├── Call/ScreenShare/Stage.vue      presenter view when a screen is shared
        ├── Call/InviteCard.vue             bottom-left share-link panel
        ├── Call/JoinNotice/Index.vue       top-center join notice / knocker queue
        └── Call/Control/Bar.vue            bottom-center overlaid controls

Message/Content/Index.vue
  └── Call/Panel/Index.vue                 compact inline room call entry + fullscreen dialog
```

---

## Components

### `Call/View.vue`

- Black (`bg-black`) full-screen flex column
- Participant grid: `auto-fit` CSS grid with `pb-24` padding so bottom row clears the control bar
- Presenter layout when screenshare is active: `ScreenShareStage` plus horizontal participant strip
- Reads connection/session state from the root call store, media streams from `call/media`, and participant/speaking state from `call/participant`
- Absolutely positioned `CallControlBar` at bottom

### `Call/Participant/Tile.vue`

Props: `participant: CallParticipant`, `isSelf: boolean`, `isSpeaking: boolean`, `isDeafened: boolean`, `isScreenSharing: boolean`, `videoStream?: MediaStream`

- `aspect-video` dark tile, rounded corners
- Circular `StyledAvatar` centered (size 96px)
- Speaking ring: animated green `outline` when `isSpeaking`
- Bottom-left: name label + mute badge (`mdi-microphone-off` when `participant.isMuted`)
- Screenshare badge (`mdi-monitor-share`) when the participant is presenting
- Self-only deafened badge (`mdi-headphones-off` when `isDeafened`)

### `Call/Control/Bar.vue`

- Centered bottom row, translucent pill (`bg-grey-darken-4/90`)
- Composes single-purpose controls directly: grouped mic + up-caret audio settings, grouped camera + up-caret video settings/backgrounds, deafen, screenshare, leave
- Video backgrounds are starter image presets applied through LiveKit track processors; selecting a preset turns the camera on, and turning the camera off resets the processor/background to none

---

## Data Flow

### Id join path

```text
/calls/[id]
  → useCallIdSubscribables(id)                composable handles full lifecycle
    → store.joinCall(id)                      creator joins immediately; knockers join after admission
      → $trpc.roomCall.joinCall.mutate({ id })
      → LiveKit room.connect(livekitUrl, livekitToken)
      → LiveKit applies microphone/camera preferences from call/knocker.ts
      → activeCallSessionId.value = callSessionId
      → setParticipants(callSessionId, participants)
      → return callSessionId
    → subscribe onJoinCall / onLeaveCall / onSetMute / onVideoChanged (callSessionId)
  → <CallView />                              reads callParticipants from store
```

### Cleanup (page unmount)

```text
onUnmounted in useCallIdSubscribables
  → participantJoin/Leave/MuteChanged/VideoChanged.unsubscribe()
  → store.leaveCall()
    → $trpc.roomCall.leaveCall.mutate({ callSessionId })
    → disconnect LiveKit room
    → reset activeCallSessionId, isDeafened, isForceMuted, local camera/screenshare/background state
```

This differs intentionally from room navigation cleanup. `/calls/[id]` is a dedicated call surface, so leaving the page means leaving the call. A normal room route change is only an observer swap and must not call `store.leaveCall()`.

---

## Differences from Room Call

| Aspect                     | Room call (`useCallSubscribables`)        | Id call (`useCallIdSubscribables`)       |
| -------------------------- | ----------------------------------------- | ---------------------------------------- |
| Entry procedure            | `readCallSessionId({ roomId })` then join | Creator/admitted `joinCall({ id })`      |
| `callRoomId`               | Set (enables admin action room checks)    | Not set (no room membership)             |
| `currentRoomCallSessionId` | Set for the viewed room only              | Not set                                  |
| Component reads            | `roomParticipants` in `CallPanel`         | `callParticipants` in `CallView`         |
| Layout                     | Compact strip inside messages view        | Full-screen (`layout: false`)            |
| Admin moderation actions   | Available (ForceMute, KickFromCall etc.)  | Not available (no room membership check) |
| Route cleanup              | Unsubscribe viewed-room observers only    | Unsubscribe observers and leave call     |
