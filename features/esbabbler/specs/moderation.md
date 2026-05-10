# Esbabbler — Moderation Spec

Unified admin action system. All procedures gated behind specific `RoomPermission` bits. Requires RBAC system — see `specs/rbac.md`.

---

## `AdminActionType` enum

`shared/models/message/AdminActionType.ts`

```typescript
export enum AdminActionType {
  ForceMute = "ForceMute",
  ForceUnmute = "ForceUnmute",
  KickFromVoice = "KickFromVoice",
  KickFromRoom = "KickFromRoom",
  TimeoutUser = "TimeoutUser",
  BanUser = "BanUser",
}
```

---

## `moderationRouter` (`server/trpc/routers/moderation.ts`)

| Procedure                                                         | Notes                                                              |
| :---------------------------------------------------------------- | :----------------------------------------------------------------- |
| `executeAdminAction({ roomId, targetUserId, type, durationMs? })` | Permission gate per action type (see below); checks `isManageable` |
| `onAdminAction({ roomId })`                                       | Subscription; targeted `userId` receives the action                |
| `readModerationLog({ roomId, cursor })`                           | Cursor-paginated; behind `ManageRoom`                              |

---

## Permission Gates

| Action          | Required permission |
| :-------------- | :------------------ |
| `ForceMute`     | `MuteMembers`       |
| `ForceUnmute`   | `MuteMembers`       |
| `KickFromVoice` | `MoveMembers`       |
| `KickFromRoom`  | `KickMembers`       |
| `TimeoutUser`   | `KickMembers`       |
| `BanUser`       | `BanMembers`        |

---

## Action Behaviours

- **Force-mute / force-unmute** — targeted client receives action via `onAdminAction`; sets `isMuted = true`, disables local toggle until `ForceUnmute`
- **Kick from voice** — targeted client calls `leaveVoice()` locally; shows snackbar
- **Kick from room** — targeted client navigates away; server deletes `usersToRooms` row
- **Timeout** — `durationMs` required; server sets `timeoutUntil` on `usersToRooms`; all message-producing mutations (`createMessage`, `forwardMessage`, etc.) reject if `timeoutUntil > now()`
- **Ban** — permanent; deletes `usersToRooms` + all `usersToRoomRoles` rows; inserts into `bans` table; join/invite flows reject banned users; `readBans`/`unbanUser` added behind `BanMembers`

---

## Moderation Log

Append-only Azure Table (`AzureTable.ModerationLog`):

- `partitionKey: roomId`, `rowKey: reverseTickedTimestamp`
- Fields: `type`, `actorId`, `targetId`, `durationMs?`
- Surfaced under room settings "Audit Log" tab (behind `ManageRoom`)

---

## Implementation Tasks

- [ ] **`AdminActionType` enum** — `shared/models/message/AdminActionType.ts`
- [ ] **`moderationRouter`** — `server/trpc/routers/moderation.ts` (3 procedures above)
- [ ] **Force-mute / force-unmute** — client handler in voice store
- [ ] **Kick from voice** — client handler; calls `leaveVoice()` + snackbar
- [ ] **Kick from room** — client handler; navigate away; server deletes `usersToRooms`
- [ ] **Timeout** — `durationMs` required; enforce in `createMessage`
- [ ] **Ban** — cascade delete + `bans` insert; `readBans`/`unbanUser` procedures
- [ ] **Moderation log** — Azure Table `ModerationLog`; "Audit Log" tab in room settings
- [ ] **Tests** — `server/trpc/routers/moderation.test.ts`; cover `executeAdminAction` (all action types + permission gates), `onAdminAction` subscription, `readModerationLog`
