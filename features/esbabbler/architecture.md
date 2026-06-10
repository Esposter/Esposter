# Esbabbler — Architecture Reference

High-level system map. Cross-cutting architecture (file uploads, Azure services): [`/architecture/`](../../architecture/).

---

## Subsystems

### Messaging

Messages stored in **Azure Table Storage** (not Postgres): `AzureTable.Messages` + `AzureTable.MessagesAscending`. `partitionKey = roomId`, `rowKey = reverseTickedTimestamp` (newest first).

Send flow:

```
Composer → createMessage tRPC → Azure Table write → messageEventEmitter → pushNotification (EventGrid) → room.updatedAt
```

Mention suggestion: TipTap → `MentionSuggestion` → prepend @everyone/@here → `room.readMembers` → `<span data-type="mention">` inserted.

### Real-time

- **In-process**: `messageEventEmitter`, `roomEventEmitter` drive tRPC subscriptions
- **Cross-process**: Azure WebPubSub handles webhook message delivery and fan-out

### Push Notifications

Filtered by `NotificationType`, mention type (@everyone/@here), and online status. Full filter logic and reminder variant → [`specs/push-notifications.md`](specs/push-notifications.md).

### Calls

LiveKit-based audio/video. Key boundary: `activeCallSessionId` (user's active call) vs `currentRoomCallSessionId` (currently viewed room). Room navigation must not leave the active call. Full spec → [`specs/call.md`](specs/call.md). Screenshare → [`specs/screenshare.md`](specs/screenshare.md).

### Scheduled Jobs

tRPC mutation → Postgres row + Azure Storage Queue (visibility delay = `runAt`, capped at 7 days) → Azure Function executes on visibility. Guard: `cancelledAt IS NULL AND completedAt IS NULL`. Full flow, Mermaid diagrams, cancellation window → [`specs/slash-commands.md`](specs/slash-commands.md).

### Offline Cache

IndexedDB mirrors Pinia store data. Full spec → [`specs/cache.md`](specs/cache.md).

### RBAC

Permission bitfield on `roomRoles` (bigint). Full spec → [`specs/rbac.md`](specs/rbac.md).

---

## DB Schema

| Table                           | Key Fields                                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `rooms`                         | `id`, `userId` (owner), `type` (Room/DM), `categoryId`, `participantKey`                              |
| `usersToRooms`                  | `userId`, `roomId` (PK), `notificationType` (All/DM/Never), `isHidden`, `timeoutUntil`                |
| `callSessionsInMessage`         | `id` (12-char text PK), `userId` (creator), `roomId` (unique FK → rooms)                              |
| `invitesInMessage`              | `id`, `roomId`, `userId`, `token` (8-char unique invite code)                                         |
| `roomRoles`                     | `id`, `roomId`, `name`, `color`, `position`, `permissions` (bigint bitfield), `isEveryone`            |
| `usersToRoomRoles`              | `userId`, `roomId`, `roleId` (composite PK)                                                           |
| `bans`                          | `roomId`, `userId`, `bannedByUserId`, `createdAt`                                                     |
| `userStatuses`                  | `userId` (PK), `status` (nullable enum), `isConnected`, `message`, `expiresAt`                        |
| `pushSubscriptions`             | `id`, `userId`, `endpoint`, `auth`, `p256dh`, `expirationTime`                                        |
| `roomCategories`                | `id`, `userId` (owner), `name`, `position`                                                            |
| `scheduledMessageJobsInMessage` | `id`, `userId`, `roomId`, `payload` (JSON discriminated union), `runAt`, `completedAt`, `cancelledAt` |

- `UserStatus`: `Online | Idle | DoNotDisturb | Offline` — nullable (`null` = connected, no manual override)
- `NotificationType`: `All | DirectMessage | Never` — on `usersToRooms`; `Never` = muted
