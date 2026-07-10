# Esbabbler — Scheduled Messages & Reminders

Server-backed `/remind` and `/schedule`: a Postgres job row + an Azure Service Bus scheduled message, executed by a Service Bus-triggered Azure Function. Postgres is the source of truth.

## Status

Schema definition complete (DB migration pending), tRPC API, Service Bus queue, queue worker, and the signed-in `/remind` + `/schedule` dialogs are implemented. **Remaining: scheduled-jobs listing/cancel UI** (see [drafts-and-sent.md](drafts-and-sent.md) Scheduled tab).

## Data Model

Postgres table `scheduledMessageJobsInMessage`:

| Field                 | Notes                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------- |
| `id`                  | UUID primary key                                                                       |
| `userId`              | creator / recipient                                                                    |
| `roomId`              | required room scope for this phase                                                     |
| `payload`             | discriminated JSON by `type`: `Reminder` (`text`) or `ScheduledMessage` (`message`)    |
| `runAt`               | timestamp                                                                              |
| `processingStartedAt` | nullable; latest processing attempt start, for observability (not a lock)              |
| `completedAt`         | nullable; set after success; failure leaves null so the queue retry runs the job again |
| `cancelledAt`         | nullable; user-initiated cancellation; workers skip jobs where this is set             |

## Procedures

- `message.scheduledMessageJob.scheduleReminder({ roomId, runAt, text })`
- `message.scheduledMessageJob.scheduleMessage({ roomId, runAt, message })` — behind `SendMessages` + read-only/slowmode checks at creation **and** execution time.
- `message.scheduledMessageJob.cancelScheduledJob({ id })`
- `message.scheduledMessageJob.readScheduledJobs({ roomId })`
- `message.scheduledMessageJob.readMyScheduledJobs({ offset, limit })`
- `message.scheduledMessageJob.readMyScheduledJobsCount()`

## Infrastructure

Basic-tier Service Bus namespaces (`dev-sbns-esposter-001` / `prod-sbns-esposter-001`) with one queue, `scheduled-message-jobs`, each. Service Bus replaced the original Storage Queue design because its trigger is a push-style AMQP listener — the Storage Queue trigger polled the storage account every ~10 seconds around the clock (the dominant storage cost) and capped visibility delays at 7 days, forcing a re-enqueue loop. Service Bus scheduled messages (`scheduledEnqueueTimeUtc`) deliver natively at `runAt` with no delay cap; Basic tier has no base charge.

Constraints:

- Queue message body contains only `{ id }`; Postgres remains the source of truth.
- Connection string auth via `AZURE_SERVICE_BUS_CONNECTION_STRING` (app runtime config `azure.serviceBus.connectionString` and function-app setting), matching the existing key-based auth grain.
- Cancellation stays DB-only (tombstone): the scheduled Service Bus message still fires, and the worker guard skips the cancelled job.

## Worker Flow

1. tRPC mutation writes the Postgres job row and schedules the id on Service Bus with `scheduledEnqueueTimeUtc = runAt`.
2. Service Bus-triggered Azure Function fetches the job row (guard: not cancelled, not completed). Missing or guarded row → exits.
3. If `runAt` is still in the future (defensive guard, e.g. clock skew), re-schedule the same id at `runAt` and exit.
4. Worker sets `processingStartedAt`, re-checks room membership + read-only/slowmode/filter state, performs the action.
5. On success, sets `completedAt`. If cancelled before the message fired, step 2 finds `cancelledAt` set and exits.
6. On failure the function throws; Service Bus redelivers the message and retries. `processingStartedAt` records the latest attempt but is not a lock.

Detailed Mermaid diagrams and the cancellation window live in [slash-commands.md](slash-commands.md).
