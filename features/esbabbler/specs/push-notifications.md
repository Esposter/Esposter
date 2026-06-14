# Esbabbler — Push Notifications

Web push notifications delivered via `web-push` library. Azure Functions handle the actual delivery.

---

## Send Flow

```
createMessage tRPC
  → getPushSubscriptionsForMessage(db, entity)
  → EventGrid: ProcessPushNotification Azure Function
  → web-push.sendNotification(subscription, payload)
```

---

## Key Files

- `packages/db/src/services/message/getPushSubscriptionsForMessage.ts` — filters recipients
- `packages/azure-functions/src/functions/ProcessPushNotification.ts` — delivery handler
- `packages/azure-functions/src/services/message/sendReminderNotification.ts` — reminder variant (direct push, no EventGrid)

---

## Recipient Filtering

`getPushSubscriptionsForMessage(db, { message, partitionKey, userId })`:

1. Parse mention `data-id` attributes from message HTML → split into `regularUserIds | @here | @everyone`
2. SQL query:

```
pushSubscriptions
  INNER JOIN usersToRooms ON userId
  LEFT JOIN userStatuses ON userId   ← always joined (needed for @here)
  WHERE roomId = partitionKey
    AND userId != sender
    AND (
      notificationType = All
      OR (DM AND userId IN regularIds)
      OR (@everyone AND notificationType != Never)
      OR (@here AND notificationType != Never AND status IN (Online, null))
    )
```

`userStatuses` is always left-joined even when no `@here` mention, so the query shape stays consistent.

---

## Reminder Notifications

`/remind` triggers a different path — no EventGrid, direct push from the Azure Function:

```
ProcessScheduledMessageJob
  → getPushSubscriptionsForUser(db, userId)
  → web-push.sendNotification(subscription, { title: "Reminder", body: text, data: { url } })
```

`getPushSubscriptionsForUser` returns all subscriptions for a single user regardless of room membership or notification preferences.

---

## NotificationType

On `usersToRooms`:

| Value           | Behavior                                   |
| --------------- | ------------------------------------------ |
| `All`           | Notified for all messages in the room      |
| `DirectMessage` | Only when directly `@mentioned` by user ID |
| `Never`         | Muted — no notifications                   |
