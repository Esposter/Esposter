# Esbabbler — Screen Share

Requires LiveKit SFU (see [`specs/call.md`](call.md)). Screen share is a LiveKit `Track.Source.ScreenShare` track published from the local participant. No new DB columns or server state needed — it is ephemeral media like audio. Implemented in the shared full-screen call view with a presenter stage and participant strip.

---

## User Experience

### Starting a share

- **Share Screen** button appears in the active call panel (right of Deafen, left of Leave)
- Clicking opens the browser's native screen picker (`getDisplayMedia`)
- User picks window / tab / monitor → track is published to the LiveKit room
- Button changes to **Stop Sharing** (red); a screenshare icon appears on the sharer's participant tile
- Optional: share system audio by checking "Share audio" in the browser picker (LiveKit publishes it as a separate `ScreenShareAudio` track)

### Viewer layout — presenter mode

When any participant publishes a `ScreenShare` track:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│          SCREEN SHARE (fills main area)              │
│          presenter name in bottom-left corner        │
│                                                      │
│                                                      │
├──────────────────────────────────────────────────────┤
│ [avatar] [avatar] [avatar]      [🎤] [🎧] [🖥] [📞]  │
│  participant strip (horizontal scroll)                │
└──────────────────────────────────────────────────────┘
```

- Main area renders `<video>` element bound to the `ScreenShareTrack`
- Participant strip replaces the video grid; camera tiles shrink to avatar-sized circles
- If multiple participants share simultaneously: tabs above the main area (`Alice's screen`, `Bob's screen`); active tab is the focused share

### Stopping a share

- Sharer clicks **Stop Sharing** → `room.localParticipant.setScreenShareEnabled(false)`
- Track is unpublished; LiveKit room emits `TrackUnpublished`
- Layout reverts: if video tracks still exist → video grid; if audio only → compact panel

### Spotlight / pin

- Click any participant tile (camera or screenshare) to pin it to the main area
- Pinned state: `ref<string>` (participant SID) in the call store — local only, not broadcast

---

## Implementation

### Client — `store/message/room/liveKit.ts`

```typescript
async function startScreenShare() {
  await room.localParticipant.setScreenShareEnabled(true, {
    audio: true, // capture tab/system audio if user allows
    resolution: { width: 1920, height: 1080, framerate: 15 },
  });
  callStore.setScreenSharing(true);
}

async function stopScreenShare() {
  await room.localParticipant.setScreenShareEnabled(false);
  callStore.setScreenSharing(false);
}
```

Track events from LiveKit `Room` (already bound in `useCall`):

```typescript
room.on(RoomEvent.TrackPublished, (publication, participant) => {
  if (publication.source === Track.Source.ScreenShare) {
    callStore.setRemoteScreenShareStream(participant.identity, publication.track?.mediaStream ?? null);
  }
});

room.on(RoomEvent.TrackUnpublished, (publication, participant) => {
  if (publication.source === Track.Source.ScreenShare) {
    callStore.setRemoteScreenShareStream(participant.identity, null);
  }
});
```

### Store additions (`store/message/room/call.ts`)

```typescript
// new state
const screenSharingParticipantIds = ref<string[]>([]); // session IDs of active screen sharers
const pinnedParticipantId = ref(""); // "" = no pin

// new getters
const hasScreenShare = computed(() => screenSharingParticipantIds.value.length > 0);
const activeScreenShare = computed(
  () => (pinnedParticipantId.value ? pinnedParticipantId.value : (screenSharingParticipantIds.value[0] ?? "")), // auto-select first sharer
);
```

### Components

**`Content/Call/ScreenShareButton.vue`** — starts/stops local screenshare through the call store.

**`Content/Call/ScreenShareStage.vue`** — presenter view:

- Renders when `hasScreenShare`
- `<video autoplay playsinline />` bound to the active screen stream
- Presenter label resolves from `CallParticipant` by LiveKit identity/session ID
- Participant strip remains visible below the presenter stage

**`Content/Call/ParticipantTile.vue`** — shared camera/avatar tile for grid and strip layouts.

---

## LiveKit Token Permissions

`joinCall` already grants `canPublishSources: ["microphone", "camera", "screen_share", "screen_share_audio"]`. No changes needed for screenshare — it is already included in the token grant.

---

## Moderation: Stop Others' Screenshare

New `AdminActionType.StopScreenShare`:

1. Add to `AdminActionType` enum
2. Add arm to `ExecuteAdminActionInput` discriminated union
3. Permission: `RoomPermission.MuteMembers` (reuse existing — conceptually the same gate)
4. `AdminActionPermissionMap`: map to `RoomPermission.MuteMembers`
5. Client handler (`useAdminActionMap`): calls `stopScreenShare()` on the target participant via LiveKit `room.localParticipant` (only works if you ARE the target; for remote stop, use LiveKit Admin API: `DELETE /twirp/livekit.RoomService/RemoveParticipant` or `MutePublishedTrack`)
6. Via LiveKit Admin API (server-side, from the moderation tRPC action): `roomService.mutePublishedTrack(roomId, participantSid, trackSid, true)` — mutes the screenshare track on the SFU level

---

## Browser Compatibility

`getDisplayMedia` is supported in all modern browsers. On mobile:

- iOS Safari: not supported (no API). Hide the **Share Screen** button when `!navigator.mediaDevices?.getDisplayMedia`
- Android Chrome: supported from Chrome 94+

Check at button render time:

```typescript
const canScreenShare = computed(
  () => typeof navigator !== "undefined" && "getDisplayMedia" in (navigator.mediaDevices ?? {}),
);
```

---

## File Map

| Action | File                                                                                                |
| ------ | --------------------------------------------------------------------------------------------------- |
| New    | `Content/Call/ScreenShareStage.vue` — presenter view                                                |
| New    | `Content/Call/AudioSettingsButton.vue` — microphone and speaker selection                           |
| New    | `Content/Call/VideoSettingsButton.vue` — camera selection                                           |
| Modify | `Content/Call/ControlBar.vue` — screenshare + camera + deafen + settings buttons                    |
| Modify | `Content/Call/View.vue` — screen stage, participant strip, invite card, join notice                 |
| Modify | `store/message/room/call.ts` — screenshare/pin state and local/remote screen streams                |
| Modify | `store/message/room/liveKit.ts` — `setScreenShare`, device switching, and screen track event bridge |
