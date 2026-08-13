# Scheduled message jobs architecture

Read when scheduling work to run at a future time (scheduled messages, reminders). Scheduled messages and reminders use a two-step pattern: a Postgres row + Azure **Service Bus** (not a Storage Queue).

**Flow**:

1. A tRPC mutation (`server/trpc/routers/message/scheduledMessageJob.ts`) inserts a row into `scheduledMessageJobsInMessage`.
2. The same mutation calls `enqueueScheduledMessageJob(useServiceBusSender(AzureQueue.ScheduledMessageJobs), job.id, job.runAt)` — a thin wrapper (`@esposter/db`) over `serviceBusSender.scheduleMessages(body, runAt)`. Pass `runAt` as a `Date` directly: **no clamping, no delay maths** — Service Bus takes an absolute enqueue time and delivers past-dated messages immediately.
3. The Azure Functions Service Bus queue-trigger (`ProcessScheduledMessageJob`) reads the row, atomically claims it on `processingStartedAt IS NULL` (the single-shot claim that makes the handler idempotent under at-least-once delivery), executes, marks `completedAt`. If `job.runAt` is still in the future it re-enqueues itself instead of executing.

**No timer function** — a separate polling timer is unnecessary; Service Bus scheduled delivery handles the delay.

**Azure composable** — `useServiceBusSender(AzureQueue.ScheduledMessageJobs)` (`@@/server/composables/azure/serviceBus/useServiceBusSender`) in server routes and tRPC routers. `packages/azure-functions` uses its own `getServiceBusSender(azureQueue)` wrapper over `@esposter/db`'s `getServiceBusSender(connectionString, azureQueue)`.
