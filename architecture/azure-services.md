# Azure Services — Architecture

Which Azure services are used, what each one owns, and which package accesses it.

---

## Service Map

| Service                 | What it stores / does                                                                                     | Primary access point                                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Azure Blob Storage**  | Profile images, room profile images, message file attachments, survey blobs                               | `server/composables/azure/container/useContainerClient.ts`                                                       |
| **Azure Table Storage** | Messages (newest-first + ascending mirrors), moderation logs                                              | `server/composables/azure/table/useTableClient.ts`                                                               |
| **Azure Functions**     | Async workers triggered by EventGrid — push notifications, friend request notifications, webhook delivery | `packages/azure-functions/src/functions/`                                                                        |
| **Azure Event Grid**    | Decouples `createMessage` from push delivery; app publishes events, Functions consume them                | `server/composables/azure/eventGrid/useEventGridPublisherClient.ts`                                              |
| **Azure Web PubSub**    | Webhook message delivery and cross-process fan-out (separate from tRPC subscriptions)                     | `server/composables/azure/webPubSub/useWebPubSubServiceClient.ts`                                                |
| **LiveKit**             | Audio/video SFU — signaling, media tracks, participant lifecycle                                          | `server/api/webhooks/livekit.post.ts` (webhook); `livekit-server-sdk` server-side; `livekit-client` browser-side |

---

## Blob Storage Containers

| Container (`AzureContainer`) | Contents                                                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `PublicUserAssets`           | User profile images (`{userId}/ProfileImage`), room profile images (`rooms/{roomId}/ProfileImage`)                   |
| `MessageAssets`              | Message file attachments (`{roomId}/{fileId}`). Lifecycle policy tiers blobs Cool@30d → Cold@90d to cut storage cost |
| _(survey container)_         | Survey-related blobs managed by `useUpdateBlobUrls`                                                                  |

---

## Decision: Azure Table vs Postgres

Use **Azure Table** for: high-volume, append-heavy, time-ordered data with no complex joins (messages, moderation logs). `partitionKey = roomId`, `rowKey = reverseTickedTimestamp` gives newest-first ordering for free.

Use **Postgres (Drizzle)** for: relational, queryable data — users, rooms, roles, bans, invites, push subscriptions, posts, achievements, call sessions.

When adding a new feature: pick Postgres for anything relational or queryable; pick Azure Table for anything message-like (high write volume, time-ordered, no complex joins).

---

## Event Flow: createMessage → push notification

```text
createMessage (tRPC mutation)
  → Azure Table write (messages + messagesAscending)
  → messageEventEmitter.emit("createMessage")   ← tRPC subscriptions (in-process)
  → getPushSubscriptionsForMessage()
  → EventGrid publish (PushNotificationEventGridData)
  → ProcessPushNotification (Azure Function)
  → web-push to offline users
```

EventGrid decouples the HTTP response from push delivery. The Function handles retries independently of the tRPC request lifecycle.

---

## Real-time Architecture (three layers)

| Layer                 | Technology                                                                                  | Scope                  | What it drives                                                |
| --------------------- | ------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------- |
| In-process events     | NodeJS `EventEmitter` (`messageEventEmitter`, `moderationEventEmitter`, `roomEventEmitter`) | Single server instance | tRPC subscriptions (`onCreateMessage`, `onAdminAction`, etc.) |
| Cross-process fan-out | Azure Web PubSub                                                                            | All server instances   | Webhook message delivery                                      |
| Media / signaling     | LiveKit SFU                                                                                 | External service       | Audio, video, screenshare tracks and participant lifecycle    |

tRPC subscriptions are driven by the in-process EventEmitter. LiveKit webhook (`/api/webhooks/livekit.post.ts`) feeds participant join/leave back into `callEventEmitter` so non-participants and tRPC subscriptions stay consistent without touching the SFU.
