# RoomPermission bits and admin actions

Read when adding a `RoomPermission` bit or an `AdminActionType`, or wiring an admin action hook into the call stores.

## `RoomPermission` bits

The bits are `packages/db-schema/src/models/message/RoomPermission.ts`, in the order `apps/web/content/docs/esbabbler/rbac.md` fixes, and what each grants is said once on the screen that grants it (`apps/web/app/services/message/room/role/RoomPermissionDefinitionMap.ts`). `Administrator` is always the last bit: a new permission goes before it and moves it up, and no migration follows — stored values are read as the current shape.

## `AdminActionType`

The enum is `packages/db-schema/src/models/message/AdminActionType.ts`, and every place an action touches is `apps/web/content/docs/esbabbler/moderation.md`.

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

`KickFromCall` does not check `callRoomId` — it always leaves regardless of room.
