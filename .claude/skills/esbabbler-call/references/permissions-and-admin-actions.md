# RoomPermission bits and admin actions

Read when adding a `RoomPermission` bit or an `AdminActionType`, or wiring an admin action hook into the call stores.

## `RoomPermission` bits

Current bit assignments (`packages/db-schema/src/schema/roomRolesInMessage.ts`):

| Permission        | Bit | Value | Notes                                             |
| ----------------- | --- | ----- | ------------------------------------------------- |
| `ReadMessages`    | 0   | 1     |                                                   |
| `SendMessages`    | 1   | 2     |                                                   |
| `ManageMessages`  | 2   | 4     | delete/pin others'; also Warn admin action        |
| `MentionEveryone` | 3   | 8     | @here / @everyone                                 |
| `ManageRoom`      | 4   | 16    | edit room settings                                |
| `ManageRoles`     | 5   | 32    | create/edit/delete roles below own position       |
| `ManageInvites`   | 6   | 64    | create/delete invite codes                        |
| `KickMembers`     | 7   | 128   | KickFromRoom + TimeoutUser                        |
| `BanMembers`      | 8   | 256   | CreateBan + SoftBan                               |
| `MuteMembers`     | 9   | 512   | ForceMute / ForceUnmute / **StopScreenShare**     |
| `MoveMembers`     | 10  | 1024  | KickFromCall                                      |
| `ManageNicknames` | 11  | 2048  | set per-room nicknames for other members          |
| `ManageWebhooks`  | 12  | 4096  | create/edit/delete webhooks                       |
| `Administrator`   | 13  | 8192  | all perms; bypasses hierarchy; always highest bit |

`Administrator` **must** remain the highest bit. New permissions go before it, incrementing its bit (which requires a migration to update stored values).

## `AdminActionType` enum

```ts
enum AdminActionType {
  CreateBan,
  ForceMute,
  ForceUnmute,
  KickFromCall,
  KickFromRoom,
  SoftBan,
  StopScreenShare,
  TimeoutUser,
  Warn,
}
```

`StopScreenShare` permission: `MuteMembers`. Its client hook calls `setScreenShare(false)` when `callRoomId` matches. Notification: "Your screen share has been stopped by a moderator."

## Admin action hooks in the call stores

Admin action hooks in `useCallStore` receive `roomId`. Compare it against `callRoomId` (not `activeCallSessionId`), since admin actions are room-scoped:

```ts
AdminActionHookMap[AdminActionType.ForceMute].register(async (roomId) => {
  if (sessionId.value) setMute(currentRoomCallSessionId.value, sessionId.value, true);
  if (callRoomId.value !== roomId) return;
  await setMicrophone(false);
  mediaStore.isForceMuted = true;
});
```

`KickFromCall` does not check `callRoomId` — it always leaves regardless of room.
