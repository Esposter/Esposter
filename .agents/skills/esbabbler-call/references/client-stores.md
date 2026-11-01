# Client-Side Call Stores

Read when client call state is read or added: which store owns it, and the two session ids that must never be swapped.

`useCallStore` (`store/message/room/call/index.ts`) holds two session ids that read alike and must never be swapped:

- `activeCallSessionId` — the session the user is **in** (drives `leaveCall` and every write to the user's own participant flags).
- `currentRoomCallSessionId` — the session for the **viewed** room (set by `useCallSubscribables`, drives the participant list), reset to `""` on room leave.

`callRoomId` names the room of a room call and is empty for a standalone call; the call's route, the permission checks on its participants, the admin actions' roomId checks and the invite card's hiding all read it. `callThreadRootRowKey` names a thread call's thread. Participants live in `useParticipantStore` (`call/participant.ts`) and every media flag and stream in `useMediaStore` (`call/media.ts`) — each store's return is its inventory.

`useLiveKitStore` (`store/message/room/liveKit.ts`) wraps the LiveKit `Room` — the connection, every local and remote track, and the devices. All track/media logic lives here; `useCallStore` delegates to it. Device selection is sourced from the persisted `useVoiceDeviceSettingsStore` (single source of truth) — `setActiveDevice` writes that store and per-kind watchers restart the live track through `room.switchActiveDevice`. The store keeps no per-kind selected-device refs. See `openspec/specs/esbabbler/voice-video/design.md` (Device selection).
