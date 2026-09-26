# Client-Side Call Stores

Read when client call state is read or added: which store owns it, and the two session ids that must never be swapped.

`useCallStore` (`store/message/room/call/index.ts`) holds two session ids that read alike and must never be swapped:

- `activeCallSessionId` — the session the user is **in** (drives `leaveCall`, `setMute`, `setCamera`).
- `currentRoomCallSessionId` — the session for the **viewed** room (set by `useCallSubscribables`, drives the participant list), reset to `""` on room leave.

`callRoomId` is kept **only** for the admin actions' roomId checks, and is empty for a standalone call; `callThreadRootRowKey` names a thread call's thread. Participants live in `useParticipantStore` (`call/participant.ts`) and every media flag and stream in `useMediaStore` (`call/media.ts`) — each store's return is its inventory.

`useLiveKitStore` (`store/message/room/liveKit.ts`) wraps the LiveKit `Room` — the connection, every local and remote track, and the devices. All track/media logic lives here; `useCallStore` delegates to it. Device selection is sourced from the persisted `useVoiceDeviceSettingsStore` (single source of truth) — `setActiveDevice` writes that store and per-kind watchers restart the live track through `room.switchActiveDevice`. The store keeps no per-kind selected-device refs. See `apps/web/content/docs/esbabbler/voice-video.md` (Device selection).
