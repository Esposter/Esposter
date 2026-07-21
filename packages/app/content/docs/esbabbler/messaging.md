---
title: Messaging
description: How messages are stored in Azure Table Storage, sent through tRPC, and fanned out in real time.
---

# Messaging

Messages are high-volume, append-heavy, and time-ordered, so they live in Azure Table Storage rather than Postgres. Everything relational around them (rooms, membership, roles) stays in Postgres.

## How it works

Messages are stored in `AzureTable.Messages` with `partitionKey = roomId` and `rowKey = reverseTickedTimestamp` — a reverse-ticked timestamp is `MAX_TICKS - now`, so lexicographic row order is newest-first, which matches how a chat list paginates. `AzureTable.MessagesAscending` is a companion index table keyed by the original timestamp so messages can be read in both directions (thread view, jump-to-message). `AzureTable.MessagesMetadata` holds per-message companion data.

Sending a message flows through one server service, `createUserMessage`, which writes storage, notifies live subscribers, and kicks off push delivery:

```mermaid
sequenceDiagram
    participant C as Composer (RichTextEditor)
    participant T as message.createMessage (tRPC)
    participant AT as Azure Table Storage
    participant E as messageEventEmitter
    participant EG as Azure Event Grid
    participant F as processPushNotification (Azure Function)

    C->>T: createMessage({ roomId, message })
    T->>AT: insert Messages + MessagesAscending rows
    T->>E: emit("createMessage", entity)
    E-->>C: onCreateMessage subscription delivers to connected members
    T->>T: getPushSubscriptionsForMessage(db, entity)
    T->>EG: publish PushNotificationEventGridData (only if recipients exist)
    EG->>F: event delivered
    F->>F: web-push to each subscription
    T->>T: roomEventEmitter.emit("updateRoom") — bumps room.updatedAt
```

Real-time delivery is two-layered:

- **In-process** — `messageEventEmitter` / `roomEventEmitter` drive tRPC subscriptions (`onCreateMessage`, `onUpdateMessage`, `onDeleteMessage`, `onCreateTyping`). The app runs a single Node process, so this is sufficient (see [cross-process event bridge](/docs/esbabbler/deferred/cross-process-event-bridge)).
- **Azure Web PubSub** — used for inbound webhook message delivery; clients get a scoped access URL via `getWebPubSubClientAccessUrl`.

Push notification filtering and delivery detail lives in [/docs/esbabbler/push-notifications](/docs/esbabbler/push-notifications).

## Message types

`MessageType` (in `@esposter/db-schema`) discriminates rendering and behaviour: `Message`, `Poll`, `Call` (call started / call-end duration system message), `EditRoom`, `PinMessage`, `System` (join/leave), and `Webhook`. Adding a type requires updating `MessageEntityMap` (type → entity class) and `MessageComponentMap` (type → Vue rendering component).

Mentions are stored as HTML: the TipTap mention suggestion inserts `<span data-type="mention" data-id="...">` nodes, which the server later parses for notification targeting and the client resolves to display names (see [/docs/esbabbler/nicknames](/docs/esbabbler/nicknames)).

## Procedures

The `message` router is flat-merged at the tRPC root, with `emoji`, `moderation`, and `scheduledMessageJob` nested under it. Highlights:

| Procedure                         | Auth   | Purpose                                             |
| --------------------------------- | ------ | --------------------------------------------------- |
| `createMessage`                   | member | Write message, emit, trigger push                   |
| `updateMessage` / `deleteMessage` | author | Edit/delete own messages (message-scoped procedure) |
| `forwardMessage`                  | member | Forward into another room                           |
| `pinMessage` / `unpinMessage`     | member | Room-wide pins                                      |
| `readMessages` / `readThread`     | member | Cursor pagination / thread view                     |
| `searchMessages`                  | member | Filtered search via the Azure AI Search index       |
| `readMySentMessages`              | authed | Cross-room sent list from the Search index          |
| `onCreateMessage` etc.            | member | Live subscriptions                                  |
| `createTyping` / `onCreateTyping` | member | Typing indicators                                   |
| `generate*FileSas*`               | member | SAS-based file upload/download URLs                 |

## Key files

| File                                                        | Role                                                |
| ----------------------------------------------------------- | --------------------------------------------------- |
| `packages/app/server/trpc/routers/message/index.ts`         | Message router (procedures above)                   |
| `packages/app/server/services/message/createUserMessage.ts` | Send pipeline: table write, emit, EventGrid publish |
| `packages/db-schema/src/models/azure/table/AzureTable.ts`   | Table name enum (Messages, MessagesAscending, …)    |
| `packages/db-schema/src/models/message/MessageType.ts`      | Message type discriminator                          |
| `packages/app/server/services/message/events/`              | `messageEventEmitter` and friends                   |

## Notes

- Never bypass `createUserMessage` when adding a message-producing path — timeout, read-only, slowmode, and word-filter checks happen there and in the member procedures. `forwardMessage` is the one existing exception: it fans out over N rooms with a per-room `assertCanCreateMessage` and cloned files, so it reproduces the pipeline instead of calling it. Any _new_ path goes through `createUserMessage`.
- **Send order is fixed on every send path.** Table write → advance the slowmode clock (`updateUserToRoom`, awaited: a path that skips it keeps comparing against a stale `lastMessageAt` and slowmode silently never applies) → `messageEventEmitter.emit` → best-effort side effects. Everything before the emit is fatal, because a failure there means the send did not happen; everything after it logs and never throws (`getResultAsync(...).match(noop, console.error)` around the EventGrid publish — a lost push must never fail a message that already landed).
- Azure Table has no joins: anything that must be queried relationally (e.g. who to notify) is resolved against Postgres at send time.
- **Single owner per store transition.** The subscription handler owns every remote-visible state change: `onCreateMessage`/`onUpdateMessage`/`onDeleteMessage` write the message list through `storeCreateMessage`/`storeUpdateMessage`/`storeDeleteMessage`, and the same rule holds across the room, userToRoom, emoji, pin, call, and member stores. A caller-side store mutation is kept only when it is a genuine optimistic update with revert (the `useMutation` `applyOptimistic` blocks, and the `isLoading` optimistic send) or when the emit excludes the actor's own device (`getRoomEventSubscription`, `getIsSameDevice`) so the subscription can never reach the caller. No store applies a plain, non-optimistic mutation that a caller-reaching subscription would double-apply.
- **Idempotent by composite key.** Because the subscription echoes back to the sender for `isSendToSelf` sends (forward, pin) and on transport reconnect, `storeCreateMessage` dedups on `[partitionKey, rowKey]` via `createOperationData`, and update/delete handlers are set/filter operations that re-apply cleanly. Re-emitting an already-applied event is a no-op — locked in by `store/message/data.test.ts` and `services/shared/createOperationData.test.ts`.
- **Ascending reads re-project onto the index order.** `readMessages({ order: Asc })` reads oldest-first ids from `MessagesAscending`, then re-orders the joined `Messages` rows onto that sequence rather than trusting the Messages table's newest-first scan order — otherwise an ascending page comes back reversed.
