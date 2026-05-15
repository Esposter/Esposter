# Esbabbler — Moderation Spec

Unified admin action system. All procedures gated behind specific `RoomPermission` bits. Requires RBAC system — see `specs/rbac.md`.

---

## `AdminActionType` enum

`packages/db-schema/src/models/message/AdminActionType.ts`

```typescript
export enum AdminActionType {
  CreateBan = "CreateBan",
  ForceMute = "ForceMute",
  ForceUnmute = "ForceUnmute",
  KickFromCall = "KickFromCall",
  KickFromRoom = "KickFromRoom",
  SoftBan = "SoftBan",
  StopScreenShare = "StopScreenShare",
  TimeoutUser = "TimeoutUser",
  Warn = "Warn",
}
```

---

## `moderationRouter` (`server/trpc/routers/message/moderation.ts`)

| Procedure                                                         | Notes                                                              |
| :---------------------------------------------------------------- | :----------------------------------------------------------------- |
| `executeAdminAction({ roomId, targetUserId, type, durationMs? })` | Permission gate per action type (see below); checks `isManageable` |
| `onAdminAction({ roomId })`                                       | Subscription; targeted `userId` receives the action                |
| `readBans({ roomId, cursor, limit })`                             | Cursor-paginated; behind `BanMembers`                              |
| `deleteBan({ roomId, userId })`                                   | Removes a ban; behind `BanMembers`                                 |
| `readModerationLog({ roomId, cursor })`                           | Cursor-paginated; behind `ManageRoom`                              |

---

## Permission Gates

| Action            | Required permission |
| :---------------- | :------------------ |
| `CreateBan`       | `BanMembers`        |
| `ForceMute`       | `MuteMembers`       |
| `ForceUnmute`     | `MuteMembers`       |
| `KickFromCall`    | `MoveMembers`       |
| `KickFromRoom`    | `KickMembers`       |
| `SoftBan`         | `BanMembers`        |
| `StopScreenShare` | `MuteMembers`       |
| `TimeoutUser`     | `KickMembers`       |
| `Warn`            | `ManageMessages`    |

---

## Action Behaviours

- **Force-mute / force-unmute** — targeted client receives action via `onAdminAction`; call store hook toggles local microphone and force-muted state
- **Kick from call** — targeted client calls `leaveCall()` through `AdminActionHookMap`; shows snackbar
- **Kick from room** — targeted client navigates away; server deletes `usersToRooms` row
- **Stop screen share** — server uses LiveKit Admin API to revoke screen-share publish sources and mute active screen-share tracks for the target's active call sessions; targeted client also calls `setScreenShare(false)` through the call store hook and shows a snackbar
- **Timeout** — `durationMs` required; server sets `timeoutUntil` on `usersToRooms`; all message-producing mutations (`createMessage`, `forwardMessage`, etc.) reject if `timeoutUntil > now()`
- **Create ban** — permanent; deletes `usersToRooms`; inserts into `bans` table; join/invite flows reject banned users; `readBans`/`deleteBan` are behind `BanMembers`
- **Soft ban** — creates a ban, removes the user from the room, and marks their visible messages deleted
- **Warn** — records and emits the action; targeted client shows a warning notification

---

## Moderation Log

Append-only Azure Table (`AzureTable.ModerationLog`):

- `partitionKey: roomId`, `rowKey: reverseTickedTimestamp`
- Fields: `type`, `actorId`, `targetId`, `durationMs?`
- Surfaced under room settings "Audit Log" tab (behind `ManageRoom`)

---

## Implementation Tasks

- [x] **`AdminActionType` enum** — `packages/db-schema/src/models/message/AdminActionType.ts`
- [x] **`moderationRouter`** — `server/trpc/routers/message/moderation.ts`
- [x] **Force-mute / force-unmute** — client hook in call store plus snackbar notification path
- [x] **Kick from call** — client hook calls `leaveCall()` plus snackbar notification path
- [x] **Kick from room** — client handler deletes local room state; server deletes `usersToRooms`
- [x] **Stop screen share** — server-side LiveKit enforcement plus client hook/snackbar path
- [x] **Timeout** — `durationMs` required; enforced in message-producing paths
- [x] **Create ban / soft ban / warn** — covered by `executeAdminAction`
- [x] **Moderation log** — Azure Table `ModerationLog`; "Audit Log" tab in room settings
- [x] **Tests** — `server/trpc/routers/message/moderation.test.ts`
