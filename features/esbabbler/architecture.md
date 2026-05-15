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

### Offline Cache

Full spec: [`specs/cache.md`](specs/cache.md).

- IndexedDB is a local mirror of Pinia store data, not behavior embedded in pagination helpers.
- Feature-level `use*Cache` composables should be thin wrappers around `useCursorPaginationCache` / `useOffsetPaginationCache`.
- First-page reads should use `useReadCursorPaginationCache` / `useReadOffsetPaginationCache` for online query vs offline IndexedDB branching.
- `ReadItemsCacheOptions` has been removed; do not reintroduce cache parameters to `readItems`.

---

## Call & Video

Full spec: [`specs/call.md`](specs/call.md). Screenshare: [`specs/screenshare.md`](specs/screenshare.md).

### Key file map (v2 current — LiveKit)

- `server/trpc/routers/room/call.ts` — registered as `roomCall` (not `call` — reserved word); procedures use `callSessionId`, not `roomId`; `joinCall({ id })` and `joinCallByRoomId({ roomId })` return `{ callSessionId, participants, livekitUrl, livekitToken }`
- `server/services/message/call/callParticipantMap.ts` — `Map<callSessionId, Map<sessionId, CallParticipant>>` (keyed by callSessionId, not roomId)
- `server/services/message/call/callStartTimeMap.ts` — `Map<callSessionId, Date>` for call duration calculation
- `server/services/message/call/readCallSessionId.ts` — reads call session id for a room; returns `""` if none exists
- `server/api/webhooks/livekit.post.ts` — LiveKit participant joined/left backup path into `callParticipantMap` + `callEventEmitter`
- `app/composables/message/subscribables/useCallSubscribables.ts` — room observer only: calls `readCallSessionId` on room entry → sets `currentRoomCallSessionId`; subscribes/unsubscribes to that room's call events without leaving the active call
- `app/composables/message/room/call/useCallIdSubscribables.ts` — dedicated `/calls/[id]` lifecycle; page unmount is an explicit call leave because the call page is the call surface
- `app/store/message/room/call/index.ts` — root call/session orchestration: `activeCallSessionId` (drives tRPC ops), `currentRoomCallSessionId` (viewed room), and `callRoomId` (admin action checks)
- `app/store/message/room/call/participant.ts` — participant map, speaking IDs, and join notice state
- `app/store/message/room/call/media.ts` — camera, screen share, deafen, virtual background, pin, and local/remote media stream state
- `app/store/message/room/liveKit.ts` — LiveKit `Room` wraps media, active speaker, remote audio, screen share, device switching, and camera track processors

### Call lifetime boundary

Room navigation is not call membership. A user remains in a call until one of these explicit leave boundaries occurs:

- They click **Leave Call** from the room call controls, call view, or status bar controls.
- They are removed by a moderation action that semantically ejects them from the call or room (`KickFromCall`, `KickFromRoom`, `TimeoutUser`, `CreateBan`).
- The browser tab/session actually disconnects, crashes, logs out, or loses its LiveKit connection long enough for LiveKit to emit `participant_left`.
- The standalone `/calls/[id]` page unmounts, because that route is the whole call surface rather than a room observer.

Changing rooms should only change `currentRoomCallSessionId`, participant observers, and inline room UI. It must not call `leaveCall`, disconnect LiveKit, reset `activeCallSessionId`, or remove the local participant from `callParticipantMap`.

Implementation shape:

```text
useCallSubscribables cleanup on room change
  → unsubscribe onJoinCall/onLeaveCall/onSetMute/onVideoChanged for the old room session
  → setCurrentRoomCallSessionId("")
  → clear room-scoped speaker hints if needed
  → do not call roomCall.leaveCall
  → do not disconnect LiveKit

explicit leave action / moderation leave
  → callStore.leaveCall()
  → roomCall.leaveCall({ callSessionId: activeCallSessionId })
  → disconnect LiveKit
  → reset active call state
```

The persistent `StatusBar.vue` in the left sidebar is the return path when the user navigates away from the call room. `callRoomId` remains the room that owns the active call; clicking the status link navigates back to that room without changing call membership.

### Data flow: join call (v2 — LiveKit)

```text
Client A (joining)                     Server (tRPC)               Client B (in room)
        |                                    |                              |
        |-- readCallSession({ roomId }) ----->|                              |
        |<-- callSessionId (string) ---------|  (reads callSessionsInMessage)
        |   [set currentRoomCallSessionId]   |                              |
        |-- onJoinCall.subscribe(callSessionId)                             |
        |-- joinCallByRoomId({ roomId }) ---->|  (creates session if new)    |
        |<-- { callSessionId, participants, livekitUrl, livekitToken }        |
        |   [set activeCallSessionId]         |-- onJoinCall emit --------->|
        |-- room.connect(livekitUrl, token) ------------------------------->|
        |<===================== audio/video flows via LiveKit SFU ==========>|
```

### Data flow: join via shareable link (v1)

```text
Guest (any authed user)                Server (tRPC)               Room participants
        |                                    |                              |
        |-- joinCall({ id }) ---------------->|  (no room membership check) |
        |<-- { callSessionId, participants, livekitUrl, livekitToken }        |
        |-- room.connect(livekitUrl, token) --|-- onJoinCall emit --------->|
```

### Data flow: screenshare start

```text
Sharer                          LiveKit SFU              Viewers
   |-- getDisplayMedia() --------|                          |
   |-- publishTrack(screenShare)->|                         |
   |                             |-- TrackPublished ------->|
   |                             |   (LiveKit Room event)   |
   |                             |       [attach video to <video> el, switch to presenter layout]
```

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

## DB Schema

| Table                   | Key Fields                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| `rooms`                 | `id`, `userId` (owner), `type` (Room/DM), `categoryId`, `participantKey`                   |
| `usersToRooms`          | `userId`, `roomId` (PK), `notificationType` (All/DM/Never), `isHidden`, `timeoutUntil`     |
| `callSessionsInMessage` | `id` (12-char text PK, shareable code), `userId` (creator), `roomId` (unique FK → rooms)   |
| `invitesInMessage`      | `id`, `roomId`, `userId`, `token` (8-char, unique invite link code)                        |
| `roomRoles`             | `id`, `roomId`, `name`, `color`, `position`, `permissions` (bigint bitfield), `isEveryone` |
| `usersToRoomRoles`      | `userId`, `roomId`, `roleId` (composite PK)                                                |
| `bans`                  | `roomId`, `userId`, `bannedByUserId`, `createdAt`                                          |
| `userStatuses`          | `userId` (PK), `status` (nullable enum), `isConnected`, `message`, `expiresAt`             |
| `pushSubscriptions`     | `id`, `userId`, `endpoint`, `auth`, `p256dh`, `expirationTime`                             |
| `roomCategories`        | `id`, `userId` (owner), `name`, `position`                                                 |

RBAC details (permission bitfield, service layer, role hierarchy) → see `specs/rbac.md`.

### UserStatus enum

`Online | Idle | DoNotDisturb | Offline` — nullable (`null` = connected, no manual override)

### NotificationType enum

`All | DirectMessage | Never` — on `usersToRooms`; `Never` = muted

---

## Message Storage

Messages stored in **Azure Table Storage** (not Postgres):

- `AzureTable.Messages` + `AzureTable.MessagesAscending` (both updated on create)
- `partitionKey = roomId`, `rowKey = reverseTickedTimestamp` (newest first)
- `MessageType` enum: `Message | PinMessage | Call | ...`
- Pinned messages filter: `isPinned = true`
