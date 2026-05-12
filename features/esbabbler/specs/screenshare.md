# Esbabbler — Screen Share

Requires LiveKit SFU (see [`specs/call.md`](call.md)). Screen share is a LiveKit `Track.Source.ScreenShare` track published from the local participant. No new DB columns or server state needed — it is ephemeral media like audio.

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

### Client — `useCall.ts`

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
    callStore.setScreenSharingParticipant(participant.sid);
  }
});

room.on(RoomEvent.TrackUnpublished, (publication, participant) => {
  if (publication.source === Track.Source.ScreenShare) {
    callStore.clearScreenSharingParticipant(participant.sid);
  }
});
```

### Store additions (`store/message/room/call.ts`)

```typescript
// new state
const screenSharingParticipantSids = ref<string[]>([]); // SIDs of active screen sharers
const pinnedParticipantId = ref(""); // "" = no pin

// new getters
const hasScreenShare = computed(() => screenSharingParticipantSids.value.length > 0);
const activeScreenShare = computed(
  () => (pinnedParticipantId.value ? pinnedParticipantId.value : (screenSharingParticipantSids.value[0] ?? "")), // auto-select first sharer
);
```

### Components

**`Content/CallPanel.vue`** — add screenshare button:

```vue
<VBtn
  :icon="isScreenSharing ? 'mdi-monitor-off' : 'mdi-monitor-share'"
  :color="isScreenSharing ? 'error' : undefined"
  @click="isScreenSharing ? stopScreenShare() : startScreenShare()"
/>
```

**`Content/CallScreenShare.vue`** (new) — presenter view:

- Renders when `hasScreenShare`
- `<video ref="videoEl" autoplay playsinline />` — bound via `publication.track.attach(videoEl)`
- Tab bar when `screenSharingParticipantSids.length > 1`
- Presenter label: `remote participant name` from LiveKit participant object
- `v-if="hasScreenShare"` inserted in `Content/Index.vue` above the message list (same as CallPanel):

```vue
<MessageContentHeader />
<v-divider />
<MessageContentCallPanel v-if="isInCall" />
<MessageContentCallScreenShare v-if="hasScreenShare" />
<MessageContentMessages />
```

**`Content/CallVideoGrid.vue`** (new) — grid of camera tiles when no screenshare:

- `v-if="isInCall && !hasScreenShare && hasCameraParticipants"`
- CSS grid, adapts columns: 1→2→3→4 as participant count grows
- Each tile: `<video>` + name label + mute badge + speaking ring
- Falls back to compact avatar strip when all cameras are off

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

| Action | File                                                                                                                                         |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| New    | `Content/CallScreenShare.vue` — presenter view                                                                                               |
| New    | `Content/CallVideoGrid.vue` — camera tile grid                                                                                               |
| Modify | `Content/CallPanel.vue` — add screenshare + camera + deafen buttons                                                                          |
| Modify | `Content/Index.vue` — insert `CallScreenShare` and `CallVideoGrid`                                                                           |
| Modify | `store/message/room/call.ts` — add screenshare/pin state                                                                                     |
| Modify | `composables/message/room/call/useCall.ts` — add `startScreenShare`, `stopScreenShare`, `toggleCamera`, `toggleDeafen`, track event handlers |
| Modify | `shared/models/room/call/CallParticipant.ts` — add `isCameraEnabled` field                                                                   |
| Modify | `server/trpc/routers/room/moderation.ts` — add `StopScreenShare` action                                                                      |
