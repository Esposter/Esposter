# Esbabbler — Scheduled Messages & Reminders

Server-backed `/remind` and `/schedule`: a Postgres job row + an Azure Storage Queue with a visibility delay, executed by a queue-triggered Azure Function. Postgres is the source of truth.

## Status

Schema definition complete (DB migration pending), tRPC API, Storage Queue, queue worker, and the signed-in `/remind` + `/schedule` dialogs are implemented. **Remaining: scheduled-jobs listing/cancel UI** (see [drafts-and-sent.md](drafts-and-sent.md) Scheduled tab).

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

Reuse existing environment storage accounts and the Azure Functions app. One Storage Queue, `scheduled-message-jobs`, with queue-data-contributor access following the existing function-app role-assignment pattern. Queue messages suffice (small async payloads, charged as storage operations); Durable Functions / Service Bus are unnecessary until orchestration, sessions, topics, or stronger delivery semantics are needed.

Constraints:

- Queue message contains only `{ id }`; Postgres remains the source of truth.
- Queue messages are plain JSON text — `packages/azure-functions/host.json` must keep `extensions.queues.messageEncoding = "none"` because `@azure/storage-queue` does not base64-encode for us.
- tRPC mutation enqueues the id with a visibility delay matching `runAt`, capped at 7 days (Azure Queue limit).
- If a message becomes visible before `runAt` (schedule > 7 days out), the queue-trigger re-enqueues the same id with the remaining delay, capped again at 7 days.

## Worker Flow

1. tRPC mutation writes the Postgres job row and enqueues the id with a visibility delay matching `runAt` (capped at 7 days).
2. Queue-triggered Azure Function fetches the job row (guard: not cancelled, not completed). Missing or guarded row → exits.
3. If `runAt` is still in the future, re-enqueue the same id with the remaining delay and exit.
4. Worker sets `processingStartedAt`, re-checks room membership + read-only/slowmode/filter state, performs the action.
5. On success, sets `completedAt`. If cancelled before the message became visible, step 2 finds `cancelledAt` set and exits.
6. On failure the function throws; the queue message becomes visible again and retries. `processingStartedAt` records the latest attempt but is not a lock.

Detailed Mermaid diagrams and the cancellation window live in [slash-commands.md](slash-commands.md).
