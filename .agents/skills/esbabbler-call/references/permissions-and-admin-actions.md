# RoomPermission bits and admin actions

Read when adding a `RoomPermission` bit or an `AdminActionType`, or wiring an admin action hook into the call stores.

## `RoomPermission` bits

The bits are `packages/db-schema/src/models/message/RoomPermission.ts`, in the order `openspec/specs/esbabbler/rbac/design.md` fixes, and what each grants is said once on the screen that grants it (`apps/web/app/services/message/room/role/RoomPermissionDefinitionMap.ts`). `Administrator` is always the last bit: a new permission goes before it and moves it up, and no migration follows — stored values are read as the current shape.

## `AdminActionType`

The enum is `packages/db-schema/src/models/message/AdminActionType.ts`, and every place an action touches is `openspec/specs/esbabbler/moderation/design.md`.

## Admin action hooks in the call stores

Admin action hooks in `useCallStore` receive `roomId`. Compare it against `callRoomId` (not `activeCallSessionId`), since admin actions are room-scoped:

```ts
AdminActionHookMap[AdminActionType.ForceMute].register(async (roomId) => {
  if (callRoomId.value !== roomId) return;
  if (participantStore.sessionId) setParticipantMuted(activeCallSessionId.value, participantStore.sessionId, true);
  await setMicrophone(false);
  mediaStore.isForceMuted = true;
});
```

`KickFromCall` checks `callRoomId` like the other leave hooks — the kick is from that room's call, never from a call the user is in elsewhere.

## Narrowing a connection's publishing

`ForceMute` and `StopScreenShare` narrow what a connection may publish, and a preset switch alone leaves a live track on the air. So `updateRealtimeKitParticipantPreset` (`server/services/realtimeKit/`) kicks the connection, adds it back under the narrower preset, and emits a `joinCall` event of `type: "rejoin"` carrying the new token. `onJoinCall` yields it to that user alone, and `useRealtimeStore.rejoin` joins the meeting again with it. `ForceUnmute` widens a connection and only switches its preset. A `KickFromCall` or a membership action is a plain departure with no token.

The client's `roomLeft` with state `kicked` is the server's kick and does not end the call, so `registerSelf` does not run the disconnect handler for it. Only a moderator's admin action or the rejoin itself changes the call.
