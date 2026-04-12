# Esbabbler — Voice UI Refactor + DM Voice

## Overview

Two problems to solve together:

1. **Voice panel is in the wrong place** — currently a "Voice" section embedded in the left sidebar under Rooms. Discord-style: voice lives in the header (start/join) and as an active-call panel overlaid above the message list.
2. **DM voice is unsupported** — `joinVoiceChannel` and `leaveVoiceChannel` on the server need to allow `RoomType.DirectMessage`. The entire WebRTC infrastructure already works; it just needs the room-type gate removed and a "call started" system message.
3. **Header overflow on mobile** — 5 icon buttons in `Header.vue` + adding a voice button = 6. Needs a secondary overflow menu on small screens.

---

## UX Design (Discord reference)

### Header — idle (no active call)

Right-hand `#append` slot of `MessageContentHeader.vue`:

```
[🔔 notification] [📌 pin] [➕ add friends] [👥 members] [🔍 search]   (desktop: all visible)
[📞 start call  ]                                                        (always visible, rooms + DMs)
```

On mobile (`sm` breakpoint and below): collapse pin, add-friends, members into a `⋮` overflow `v-menu`. Voice and search always stay visible — they are the highest-priority actions.

### Header — active call (in channel)

Replace the phone button with a live compact badge showing participant count and a pulsing green dot:

```
[🟢 2 in call ▾]   (dropdown shows participant list + leave option)
```

### Active call panel

When `isInChannel` is true, render a `MessageContentVoicePanel.vue` between the header divider and the message list (i.e., inside `MessageContentIndex.vue`, not the sidebar). The panel is:

- A compact horizontal strip (≈64px tall, collapsible)
- Shows circular participant avatars with speaking ring + mute badge
- Control buttons on the right: **Mute** / **Deafen** / **Leave** (red)
- A `^` chevron to collapse it to a 24px title bar when the user wants more message space

```
┌──────────────────────────────────────────────────────────────┐
│ 🔊 Voice  [avatar] [avatar]          [🎤] [🎧] [📞 Leave]  [^]│
└──────────────────────────────────────────────────────────────┘
```

On mobile the panel is still shown but avatars collapse to a count badge ("2 participants").

### Sidebar — remove voice section

Remove `<MessageLeftSideBarVoicePanel />` and the surrounding `<template v-if="currentRoomId">` block from `LeftSideBar/Index.vue`. All voice state lives in the header + content panel.

### StatusBar (bottom-left) — "In a Call" indicator

When `isInChannel` is true, add a small green "In a call · #room-name" label above the user card in `LeftSideBar/StatusBar.vue`. Clicking it navigates to the room. This gives the user a persistent way to return to the room they're calling in without disrupting the sidebar.

### DM voice call events

When a user starts a call in a DM, post a `MessageType.VoiceCall` system message (new type): "Lain started a call." so the thread shows call history. This matches Discord's DM call UX.

---

## Changes Required

### 1. Server — allow DMs in voice procedures

`server/trpc/routers/room/voice.ts` — remove any `RoomType.Room`-only guard in `joinVoiceChannel` and `leaveVoiceChannel`. The existing membership check via `usersToRooms` already gates access correctly for DMs.

### 2. DB/shared — new message type

```typescript
// packages/db-schema/src/schema/MessageType.ts
enum MessageType {
  // ...existing...
  VoiceCall = "VoiceCall", // "X started a call"
}
```

Post `VoiceCall` in `joinVoiceChannel` when the participant count goes from 0 → 1 (first joiner starts the call).

Render as a system message (same style as `EditRoom` / `PinMessage`) in a new `Message/Model/Message/Type/VoiceCall.vue`.

### 3. Remove sidebar voice components

- `LeftSideBar/Index.vue` — remove `<MessageLeftSideBarVoicePanel />` block
- Delete `LeftSideBar/Voice/Panel.vue`, `Participant.vue`, `ParticipantList.vue`
- Keep `useVoiceChannel.ts`, `store/message/room/voice.ts` — unchanged

### 4. Header — voice button + mobile overflow

`Message/Content/Header.vue`:

```vue
<template #append>
  <MessageContentVoiceCallButton />
  <!-- new, always visible -->
  <MessageContentNotificationSettingsMenuButton :room-id="currentRoom.id" />
  <MessageContentPinnedMessagesMenuButton />
  <MessageContentAddFriendsDialogButton />
  <MessageContentShowMemberListButton />
  <MessageContentShowSearchButton />
  <MessageContentHeaderOverflowMenu />
  <!-- new, mobile only (v-if="$vuetify.display.smAndDown") -->
</template>
```

`MessageContentVoiceCallButton.vue` — reads `isInChannel` from the voice store:

- Idle: phone icon, tooltip "Start Voice Call" / "Join Voice Call" → calls `join()`
- Active: green pulsing badge with participant count + chevron → opens a `v-menu` listing participants + a "Leave" button

`MessageContentHeaderOverflowMenu.vue` — `v-menu` triggered by `mdi-dots-vertical`, only shown on `smAndDown`. Contains the same actions as the buttons it replaces (pin, add friends, members) as `v-list-item` entries.

On desktop (`mdAndUp`): show all buttons individually as today.
On mobile: hide pin/add-friends/members buttons and show the overflow menu instead.

### 5. Active call panel

`Message/Content/Index.vue`:

```vue
<MessageContentHeader />
<v-divider />
<MessageContentVoicePanel />
<!-- new, v-if="isInChannel", between header and messages -->
<MessageContentMessages />
```

`Message/Content/VoicePanel.vue`:

- Reads `participants`, `isInChannel`, `isMuted` from `useVoiceStore`
- Calls `toggleMute`, `toggleDeafen` (new), `leave` from `useVoiceChannel`
- Collapsible (collapsed state stored in `localStorage`)
- Horizontal avatar strip with speaking ring (reuse `LeftSideBar/Voice/Participant` avatar logic)
- On mobile: collapse avatars to "N participants" count

### 6. StatusBar — in-call indicator

`LeftSideBar/StatusBar.vue`:

```vue
<Transition>
  <div v-if="isInChannel" px-2 pb-1 ...>
    🟢 In a call · {{ currentRoomName }}
  </div>
</Transition>
<StyledCard ...> <!-- existing user card -->
```

---

## What Does Not Change

- `useVoiceChannel.ts` composable — no changes to WebRTC logic
- `store/message/room/voice.ts` — no changes
- Voice tRPC router procedures (except the DM type guard removal)
- `VoiceParticipant` model

---

## File Map

| Action | File                                                                    |
| ------ | ----------------------------------------------------------------------- |
| Remove | `LeftSideBar/Voice/Panel.vue`, `Participant.vue`, `ParticipantList.vue` |
| Modify | `LeftSideBar/Index.vue` — remove voice panel block                      |
| Modify | `LeftSideBar/StatusBar.vue` — add in-call indicator                     |
| Modify | `Content/Header.vue` — add voice button + overflow menu                 |
| Modify | `Content/Index.vue` — add VoicePanel between header and messages        |
| New    | `Content/VoiceCallButton.vue`                                           |
| New    | `Content/VoicePanel.vue`                                                |
| New    | `Content/HeaderOverflowMenu.vue`                                        |
| New    | `Model/Message/Type/VoiceCall.vue`                                      |
| Modify | `server/trpc/routers/room/voice.ts` — allow DM room type                |
| Modify | `db-schema/src/schema/MessageType` — add VoiceCall                      |
