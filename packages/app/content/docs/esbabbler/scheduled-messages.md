---
title: Scheduled messages
description: Server-backed /remind and /schedule — Postgres job rows + Azure Service Bus scheduled delivery via an Azure Function worker.
---

# Scheduled Messages & Reminders

Server-backed `/remind` and `/schedule`: a Postgres job row plus an Azure Service Bus scheduled message, executed by a Service Bus-triggered Azure Function. **Postgres is the source of truth** — the queue message carries only `{ id }`.

## How it works

```mermaid
sequenceDiagram
    participant U as User
    participant T as tRPC (scheduledMessageJob)
    participant DB as Postgres
    participant Q as Azure Service Bus
    participant F as ProcessScheduledMessageJob (Azure Function)
    participant EG as Azure Event Grid

    U->>T: scheduleReminder / scheduleMessage({ roomId, runAt, … })
    T->>DB: INSERT scheduledMessageJobsInMessage
    T->>Q: schedule { id } with scheduledEnqueueTimeUtc = runAt
    Note over Q: fires natively at runAt — no delay cap

    Q->>F: message fires
    F->>DB: SELECT job WHERE id AND cancelledAt IS NULL AND completedAt IS NULL
    alt job missing / cancelled / completed
        F->>F: exit (no-op)
    else runAt still in the future (clock skew guard)
        F->>Q: re-schedule same id at runAt
    else due
        F->>DB: UPDATE processingStartedAt = now() WHERE all three tombstones IS NULL
        alt zero rows — another delivery already claimed it
            F->>F: exit (no-op)
        else claimed
            F->>F: ScheduledMessage → re-check membership + read-only/slowmode — a rejection releases the claim and rethrows, so redelivery retries
            F->>DB: word filter blocked → apply the room's automod action, UPDATE cancelledAt = now(), exit
            F->>EG: Reminder → publishNotification — best-effort, logged
            F->>DB: ScheduledMessage → UPDATE lastMessageAt = now() (slowmode clock, ahead of the write)
            F->>F: ScheduledMessage → createAndBroadcastMessage
            F->>EG: publishNotification + room updatedAt touch — best-effort, logged
            F->>DB: UPDATE completedAt = now()
        end
    end
```

Failure semantics: the `processingStartedAt` update is a **single-shot claim** — it stamps the job only while `cancelledAt`, `completedAt` and `processingStartedAt` are all still null, so of two concurrent deliveries exactly one proceeds. The claim is what lets `AzureFunctionIsIdempotentMap` mark the handler idempotent: a posted message carries a fresh reverse-ticked `rowKey`, so an unclaimed rerun would duplicate it rather than repair it. The claim also splits retries in two: a failure that throws **before the claim** leaves the job unstamped, so Service Bus redelivers and the job retries — while a failure **after the claim** can no longer be retried at all, since the redelivery it would ask for is skipped by the claim itself. So everything past the message write is best-effort rather than fatal ([persist then notify](/docs/architecture/persist-then-notify)): the push notification and the room's `updatedAt` touch are logged through `context.error` and the job still reaches `completedAt`. The slowmode clock (`lastMessageAt`) is deliberately **not** in that block — it is what the next send is checked against, so it advances ahead of the write like [`createUserMessage`](/docs/esbabbler/messaging) does; behind the write a swallowed failure would leave a stale clock that keeps passing, and slowmode would silently stop applying to that member. Only a failure of the delivery itself — the message write or the `completedAt` stamp — leaves the job stuck mid-delivery, which is the cost of never posting twice. The reminder is no longer among them: it is published like every other notification, so its retries and its dead letter belong to Event Grid ([notifications](/docs/architecture/notifications)) rather than to this handler's one claim. Cancellation is DB-only (tombstone): `cancelScheduledMessageJob` sets `cancelledAt`, the scheduled Service Bus message still fires, and the worker guard skips it.

The same three tombstones gate the owner's side: `cancel`, `reschedule` and `send now` only touch a job the delivery handler has not claimed, so neither path can post the message the other is already sending.

The two delivery paths order their guards differently, because only one of them can be redelivered. `sendScheduledMessageNow` is a request: it runs every guard before flipping `cancelledAt`, and a rejection simply leaves the job scheduled. The worker runs `assertCanCreateMessage` **inside** the claim, because a word-filter block applies the room's automod action and the `cancelledAt` that records it is a second write — guarded outside the claim, a failure between those two writes leaves the job unclaimed and uncancelled, so the redelivery punishes the user again for one message. Every other rejection (read-only room, slowmode, timeout, lost membership) has no side effect, so the worker **releases the claim** (`processingStartedAt = null`) before rethrowing: Service Bus redelivers and retries, and a job whose retries exhaust stays visible to `cancel`/`reschedule`/`send now`.

**The word filter is the one rejection the worker does not retry.** Its inputs are both stored — the room's word list and the job's own message text — so every redelivery re-reads the same pair and blocks again, and the guard applies the filter's configured automod action (`Warn`/`Timeout`, audited as `AutoMod`) exactly as a live send would. Retrying it would re-apply that action and write another audit row once per delivery, so the worker tombstones the job with `cancelledAt` and returns instead of rethrowing. The scheduled path and the live path therefore share one consequence for one blocked message. Both call the same `executeAutomodAction` core in `@esposter/db`; only the app wrapper adds the in-process `moderationEventEmitter` fan-out, which does not exist in the Function process.

## Data model

Postgres table `scheduledMessageJobsInMessage`:

| Field                 | Notes                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                  | UUID primary key — the only thing put on the queue                                                                                                                 |
| `userId`              | creator / recipient                                                                                                                                                |
| `roomId`              | required room scope                                                                                                                                                |
| `payload`             | discriminated JSON by `type`: `Reminder` (`text`) or `ScheduledMessage` (`message`)                                                                                |
| `runAt`               | timestamp                                                                                                                                                          |
| `processingStartedAt` | nullable; the delivery handler's single-shot claim, stamped atomically on `IS NULL` — a claimed job is invisible to cancel/reschedule/send-now and to the listings |
| `completedAt`         | nullable; set after success; a pre-claim failure leaves it null so redelivery retries, a post-claim failure leaves the job mid-delivery rather than posting twice  |
| `cancelledAt`         | nullable; set by `cancelScheduledMessageJob`, `rescheduleMessage` (on the old row) and `sendScheduledMessageNow`; workers skip jobs where this is set              |

## Procedures

All under `message.scheduledMessageJob.`:

| Procedure                                           | Notes                                                                                                                                                                                                                                                     |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scheduleReminder({ roomId, runAt, text })`         | self-addressed notification at `runAt` → [notifications](/docs/architecture/notifications)                                                                                                                                                                |
| `scheduleMessage({ roomId, runAt, message })`       | behind `SendMessages` + read-only/slowmode checks at creation **and** execution time                                                                                                                                                                      |
| `cancelScheduledMessageJob({ id })`                 | sets `cancelledAt` tombstone                                                                                                                                                                                                                              |
| `rescheduleMessage({ id, roomId, runAt, message })` | one transaction: tombstones the old row, inserts the replacement, re-enqueues — guards re-checked                                                                                                                                                         |
| `sendScheduledMessageNow({ id })`                   | guards first, then tombstones the job and posts via `createUserMessage` — a guard rejection leaves it scheduled, and a failed send lifts the tombstone and re-enqueues the delivery the tombstone may have already consumed, so the message is never lost |
| `readScheduledMessageJobs({ roomId })`              | per-room listing                                                                                                                                                                                                                                          |
| `readMyScheduledMessageJobs({ offset, limit })`     | cross-room listing (Scheduled tab → [drafts & sent](/docs/esbabbler/drafts-and-sent))                                                                                                                                                                     |
| `readMyScheduledMessageJobsCount()`                 | tab badge count                                                                                                                                                                                                                                           |

## Notes

- **Why Service Bus rather than a Storage Queue**: a Storage Queue trigger polls the storage account around the clock whether or not a job is due — it backs off exponentially with jitter while the queue is empty, but only up to `maxPollingInterval`, never to nothing — which for this workload is the dominant storage cost, and its visibility delay caps at 7 days, so anything scheduled further out needs a re-enqueue loop of its own. Service Bus scheduled messages (`scheduledEnqueueTimeUtc`) become eligible at `runAt` with no delay cap, so nothing has to re-enqueue anything. Its receiver pulls as well — no queue is genuinely push — but it pulls over a held AMQP link against a namespace whose Basic tier has no base charge, rather than issuing billed transactions against the storage account this app already pays for by the operation. When one is actually picked up still depends on the queue's workload.
- Infrastructure: Basic-tier namespaces (`dev-sbns-esposter-001` / `prod-sbns-esposter-001`) with one queue each, `scheduled-message-jobs`. Connection-string auth via `AZURE_SERVICE_BUS_CONNECTION_STRING`, the same shared-key authentication the table, blob and Web PubSub clients use.

## Key files

| File                                                                         | Role                          |
| :--------------------------------------------------------------------------- | :---------------------------- |
| `packages/db-schema/src/schema/scheduledMessageJobsInMessage.ts`             | job table                     |
| `packages/app/server/trpc/routers/message/scheduledMessageJob.ts`            | scheduling/cancel/list router |
| `packages/app/server/composables/azure/serviceBus/useServiceBusSender.ts`    | Service Bus scheduling        |
| `packages/azure-functions/src/functions/processScheduledMessageJob.ts`       | worker trigger                |
| `packages/azure-functions/src/handlers/processScheduledMessageJobHandler.ts` | worker logic + guards         |
