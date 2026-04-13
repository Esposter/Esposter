# Esbabbler — Architecture Reference

Quick reference for AI-assisted development. Avoids re-exploring files each session.

---

## Key File Map

### Message Composer

- `app/components/Message/Model/Message/Input/Index.vue` — TipTap editor; Enter to send, ↑ to edit last, Ctrl+K palette
- `app/composables/message/useMentionExtension.ts` — configures TipTap Mention extension (info color styling)
- `app/services/message/MentionSuggestion.ts` — suggestion items: special mentions (@everyone, @here) prepended, then room members via `room.readMembers`
- `app/services/message/getRender.ts` — generic TipTap suggestion renderer (VueRenderer wrapper)
- `app/components/Message/Model/Message/MentionList.vue` — dropdown list for @ suggestions; `SuggestionProps<User | SpecialMentionItem>`

### Message Models

- `app/models/message/MentionNodeAttributes.ts` — `{ id: null | string; label?: null | string }`
- `app/models/message/SpecialMentionItem.ts` — `{ id: string; image: null; name: string }` for @here / @everyone

### Message Rendering

- `app/components/Message/Model/Message/Type/Index.vue` — renders message HTML via `v-html`; uses `useMessageWithMentions()`
- `app/components/Message/Model/Message/List/Item.vue` — maps MessageType → component via `MessageComponentMap`
- `app/composables/message/useMessageWithMentions.ts` — updates mention labels from `memberMap` store
- `app/composables/message/useMentions.ts` — thin wrapper: `computed(() => getMentions(toValue(message)))`

### Shared Mention Utilities (`packages/shared`)

- `src/services/message/constants.ts` — `MENTION_ID_ATTRIBUTE`, `MENTION_LABEL_ATTRIBUTE`, `MENTION_TYPE_ATTRIBUTE`, `MENTION_TYPE`, `MENTION_HERE_ID = "@here"`, `MENTION_EVERYONE_ID = "@everyone"`
- `src/services/message/getMentions.ts` — parses HTML, returns `span[data-type='mention']` elements

### tRPC Message Router

- `server/trpc/routers/message/index.ts`
  - `createMessage` — `getMemberProcedure`; creates Azure Table entity, emits events, calls `getPushSubscriptionsForMessage`, sends Event Grid push notification, updates room `updatedAt`
  - `forwardMessage`, `pinMessage`, `unpinMessage`, `updateMessage`, `deleteMessage`
  - Subscriptions: `onCreateMessage`, `onUpdateMessage`, `onDeleteMessage`, `onCreateTyping`

### Push Notifications

- `packages/db/src/services/message/getPushSubscriptionsForMessage.ts` — filters who gets push notified:
  - Always: `NotificationType.All`
  - Individual mention: `NotificationType.DirectMessage` + `userId IN mentionedIds`
  - `@everyone`: `notificationType != Never`
  - `@here`: `notificationType != Never` AND `userStatuses.status = Online OR NULL`
  - Left-joins `userStatuses` always (needed for @here filtering)
- `packages/azure-functions` — `ProcessPushNotification` Azure Function handles delivery

### Room / Member Queries

- `server/trpc/routers/room/index.ts` — `readMembers` procedure (cursor-paginated, filterable by name)
- `app/store/message/user/member.ts` — `memberMap: Map<userId, User>` for mention label updates

### Real-time

- `app/composables/message/subscribables/useMessageSubscribables.ts` — subscribes to `onCreateMessage`, `onUpdateMessage`, `onDeleteMessage`
- Server uses NodeJS EventEmitter: `messageEventEmitter`, `roomEventEmitter`
- Azure WebPubSub for webhook messages (separate from tRPC subscriptions)

---

## Data Flow: Send Message

```
Composer (Input/Index.vue)
  → createMessage tRPC mutation
  → createMessage() [Azure Table Storage]
  → messageEventEmitter.emit("createMessage", ...)
  → getPushSubscriptionsForMessage(db, entity)
  → EventGrid: ProcessPushNotification
  → db.update(rooms).set({ updatedAt })
  → roomEventEmitter.emit("updateRoom", ...)
```

## Data Flow: @mention Suggestion

```
User types "@"
  → MentionSuggestion.items({ query })
  → prepend matching SpecialMentionItems (@everyone, @here)
  → $trpc.room.readMembers.query({ filter: { name: query }, roomId })
  → MentionList.vue renders dropdown
  → selectItem() → command({ id, label })
  → TipTap inserts <span data-type="mention" data-id="{id}" data-label="{label}">@{label}</span>
```

## Data Flow: Push Notification Filtering

```
getPushSubscriptionsForMessage(db, { message, partitionKey, userId })
  → getMentions(message) → extract data-id attributes
  → separate: regularUserIds | @here | @everyone
  → SQL: pushSubscriptions
         INNER JOIN usersToRooms ON userId
         LEFT JOIN userStatuses ON userId  ← always joined for @here
         WHERE roomId = partitionKey
           AND userId != sender
           AND (notificationType = All
             OR (DM AND userId IN regularIds)
             OR (@everyone AND notificationType != Never)
             OR (@here AND notificationType != Never AND status IN (Online, null)))
```

---

## DB Schema Highlights

| Table               | Key Fields                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| `rooms`             | `id`, `userId` (owner), `type` (Room/DM), `categoryId`, `participantKey`                        |
| `usersToRooms`      | `userId`, `roomId` (PK), `notificationType` (All/DM/Never), `isHidden`, `timeoutUntil`          |
| `roomRoles`         | `id`, `roomId`, `name`, `color`, `position`, `permissions` (bigint bitfield), `isEveryone`      |
| `usersToRoomRoles`  | `userId`, `roomId`, `roleId` (composite PK); @everyone applied implicitly via `isEveryone` flag |
| `bans`              | `roomId`, `userId`, `bannedByUserId`, `createdAt`                                               |
| `userStatuses`      | `userId` (PK), `status` (nullable enum), `isConnected`, `message`, `expiresAt`                  |
| `pushSubscriptions` | `id`, `userId`, `endpoint`, `auth`, `p256dh`, `expirationTime`                                  |
| `roomCategories`    | `id`, `userId` (owner), `name`, `position`                                                      |

### RBAC Permission Bitfield (`RoomPermission` enum, `packages/shared`)

| Bit    | Value | Permission      | Controls                               |
| ------ | ----- | --------------- | -------------------------------------- |
| 1 << 0 | 1     | ReadMessages    | See message history                    |
| 1 << 1 | 2     | SendMessages    | Post messages                          |
| 1 << 2 | 4     | ManageMessages  | Delete/pin others' messages            |
| 1 << 3 | 8     | MentionEveryone | Use @here / @everyone                  |
| 1 << 4 | 16    | ManageRoom      | Edit room name, image, settings        |
| 1 << 5 | 32    | ManageRoles     | Create/edit/delete roles below own top |
| 1 << 6 | 64    | ManageInvites   | Create/delete invite codes             |
| 1 << 7 | 128   | KickMembers     | Remove members; timeout                |
| 1 << 8 | 256   | BanMembers      | Permanent ban                          |
| 1 << 9 | 512   | MuteMembers     | Force-mute/unmute in voice             |
| 1<<10  | 1024  | MoveMembers     | Kick from voice channel                |
| 1<<11  | 2048  | Administrator   | All permissions; bypasses hierarchy    |

Effective permissions = `BIT_OR(permissions)` over (@everyone role ∪ user's assigned roles).
Owner (`rooms.userId`) bypasses all checks.

### RBAC Service Layer (`server/services/room/rbac/`)

| Function             | Purpose                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| `getPermission`      | SQL BIT_OR; includes @everyone + assigned roles                                                     |
| `hasPermission`      | Owner bypass → Administrator bit → specific bit                                                     |
| `getTopRolePosition` | Max position across user's assigned roles                                                           |
| `isManageable`       | Actor's top > targetPosition. Caller resolves targetPosition (user's top or role.position directly) |

### UserStatus enum

`Online | Idle | DoNotDisturb | Offline` — nullable (`null` = connected, no manual override)

### NotificationType enum

`All | DirectMessage | Never` — on `usersToRooms`; `Never` = muted

---

## Message Storage

Messages stored in **Azure Table Storage** (not Postgres):

- `AzureTable.Messages` + `AzureTable.MessagesAscending` (both updated on create)
- `partitionKey = roomId`, `rowKey = reverseTickedTimestamp` (newest first)
- `MessageType` enum: `Message | PinMessage | VoiceCall | ...`
- Pinned messages filter: `isPinned = true`

---

## v2 Feature Status

All items complete. See `completed/v2.md`.

## v3 Feature Status (as of 2026-04-13)

In progress. Key themes:

- **RBAC System** — Discord-complexity: `roomRoles` table, `usersToRoomRoles` join, `RoomPermission` bitfield, `@everyone` implicit role, role hierarchy by position, owner bypass. Replaces the simple `Owner|Admin|Member` enum approach entirely. Prerequisite for all privileged operations.
- **Moderation System** — unified `moderationRouter` + `AdminActionType` enum; each action gated by specific `RoomPermission` bit; hierarchy-safe (`canManageTarget`). Unblocks v2 pending force-mute.
- **User Profile Editing** — avatar upload + bio + display name edit

See `v3.md` for full list.
