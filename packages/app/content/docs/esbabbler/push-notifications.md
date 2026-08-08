---
title: Push notifications
description: Web push delivery via EventGrid and Azure Functions, and the recipient filtering rules.
---

# Push Notifications

Web push notifications delivered with the `web-push` library. The app never pushes directly — it publishes an EventGrid event and an Azure Function does the delivery, so retries are independent of the tRPC request lifecycle (see [/docs/architecture/azure-services](/docs/architecture/azure-services)).

## How it works

```mermaid
flowchart LR
  CM["createMessage (tRPC)"] --> F["getPushSubscriptionsForMessage(db, entity)"]
  F -->|"recipients exist"| EG["EventGrid publish"]
  EG --> FN["processPushNotification<br/>(Azure Function)"]
  FN --> WP["web-push.sendNotification per subscription"]

  CM -->|"the message is a reply"| TF["notifyThreadReplyFollowers<br/>(excludes the generic push recipients)"]
  TF --> EG2["EventGrid publish"]
  EG2 --> FN2["processThreadReplyNotification<br/>(Azure Function)"]
  FN2 --> WP

  SMJ["processScheduledMessageJob<br/>(Azure Function, /remind)"] --> FU["getPushSubscriptionsForUser(db, userId)"]
  FU --> WP2["web-push direct — no EventGrid"]
```

A reply carries a third path alongside the generic push. `notifyThreadReplyFollowers` publishes its own EventGrid event to `processThreadReplyNotification`, which recomputes the thread's followers inside the Function and applies its own recipient rules. The two pushes cannot double up because the generic recipients are passed along as `excludedUserIds`, so each user is notified once per reply. The follow model and its recipient rules are [/docs/esbabbler/thread-follows](/docs/esbabbler/thread-follows).

## Recipient filtering

`getPushSubscriptionsForMessage(db, { message, partitionKey, userId })`:

1. Parse mention `data-id` attributes from the message HTML → split into `regularUserIds | @here | @everyone`.
2. One SQL query:

```text
pushSubscriptions
  INNER JOIN usersToRooms ON userId
  LEFT JOIN userStatuses ON userId   ← always joined (needed for @here)
  WHERE roomId = partitionKey
    AND userId != sender
    AND (
      notificationType = All
      OR (DirectMessage AND userId IN regularIds)
      OR (@everyone AND notificationType != Never)
      OR (@here AND notificationType != Never AND status IN (Online, null))
    )
```

`userStatuses` is always left-joined even when there is no `@here` mention, so the query shape stays consistent.

The notification title uses the sender's per-room nickname when set (see [/docs/esbabbler/nicknames](/docs/esbabbler/nicknames)).

### `NotificationType` (on `usersToRooms`)

| Value           | Behavior                                   |
| --------------- | ------------------------------------------ |
| `All`           | Notified for all messages in the room      |
| `DirectMessage` | Only when directly `@mentioned` by user ID |
| `Never`         | Muted — no notifications                   |

## Reminder notifications

`/remind` takes a different path — no EventGrid; the Service Bus-triggered `processScheduledMessageJob` Function pushes directly via `getPushSubscriptionsForUser(db, userId)`, which returns **all** subscriptions for that one user regardless of room membership or notification preferences (a reminder is self-addressed). See [/docs/esbabbler/scheduled-messages](/docs/esbabbler/scheduled-messages).

## Key files

| File                                                                             | Role                                                  |
| :------------------------------------------------------------------------------- | :---------------------------------------------------- |
| `packages/db/src/services/message/getPushSubscriptionsForMessage.ts`             | recipient filtering                                   |
| `packages/azure-functions/src/functions/processPushNotification.ts`              | delivery handler                                      |
| `packages/app/server/services/message/thread/notifyThreadReplyFollowers.ts`      | thread-reply publish (de-dupes via `excludedUserIds`) |
| `packages/azure-functions/src/handlers/processThreadReplyNotificationHandler.ts` | thread-reply delivery handler                         |
| `packages/azure-functions/src/services/sendReminderNotification.ts`              | reminder variant (direct push)                        |
