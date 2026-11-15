# Cloudflare jobs

Part of the [Cloudflare program](../infra-cloudflare-program/design.md). `apps/jobs` becomes a Worker that consumes one Queue per job and runs the nightly purge on a Cron Trigger. `apps/realtime` is the Worker that exports the per-room, per-call and per-person objects of the [realtime](../infra-cloudflare-realtime/design.md) design, whose alarms run delayed work.

## Jobs and their triggers

| Job (renamed from `AzureFunction` to `QueueJob`) | Trigger on Cloudflare                                                                        |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------- |
| `DeleteAccount`, `ExportUserData`                | queue, sent by the user router                                                               |
| `ProcessBlobDeletion`                            | queue, sent by `publishBlobDeletion` and its prefix twin                                     |
| `ProcessNotification`                            | queue, sent by `publishNotification`                                                         |
| `ProcessWebhook`                                 | queue, sent by the webhook route                                                             |
| `ReconcileStorageLedgerEntry`                    | queue fed by the `resource-assets` and `message-assets` buckets' object-create notifications |
| `DeleteOrphanedProfileImage`                     | queue fed by the `public-user-assets` bucket's object-create notification                    |
| `PurgeDeletedResources`                          | Cron Trigger `0 3 * * *`                                                                     |
| `PushWebhook`                                    | a route on the web Worker, `POST /api/webhooks/:id/:token`                                   |
| `ReplayDeadLetterEvent`                          | deleted: each dead-letter queue has a consumer that replays or quarantines                   |

The queue consumer is the jobs Worker's `queue(batch, env)` handler, dispatching on the batch's queue name to the handler the Function wrapper called; the handlers under `src/handlers` keep their bodies. A message is acknowledged when its handler resolves and retried when it throws, up to the job's retry count, then sent to the job's dead-letter queue. `AzureFunctionIsIdempotentMap` becomes the per-queue retry count: a non-idempotent job (`ProcessWebhook`) gets no retry. Event Grid's envelope (`createEventGridEvent`) is replaced by the job's payload, parsed with its existing Zod schema on receipt. R2's notification body is parsed with its own schema, replacing `blobCreatedEventGridDataSchema`.

## Dead letters recover by themselves

Every queue's dead-letter queue has a consumer on the jobs Worker, following the [no-manual-recovery](../../specs/architecture/no-manual-recovery/design.md) rule. A dead letter carries its attempt count in its own body; under the cap the consumer republishes it to its source queue with the count raised, and past the cap, or when its body fails the job's schema, it writes the message to the quarantine prefix of the private R2 bucket and logs it, and acknowledges it. The cap is counted per message, never per batch, so one poison message never strands the transient failures delivered beside it. Rejected: leaving dead letters in their queue for a person to replay, which is the outage-with-extra-steps the rule forbids.

## Scheduled work and live state

A scheduled message and a TodoList reminder are alarms on the object that owns them — the room's and the person's — and a consumer that changes live state calls the owning object's RPC method; the [realtime](../infra-cloudflare-realtime/design.md) design holds both. The jobs that remain are the queue jobs above and the nightly purge.

## Key files

| File                                                           | Role after the change                              |
| :------------------------------------------------------------- | :------------------------------------------------- |
| `packages/db-schema/src/models/queue/QueueJob.ts`              | renamed to the queue job enum                      |
| `packages/db-schema/src/services/queue/publishNotification.ts` | sends to the notification queue                    |
| the Event Grid envelope                                        | deleted                                            |
| `apps/realtime/src/durableObjects/RoomObject.ts`               | an alarm row on the room's object                  |
| `apps/realtime/src/durableObjects/UserObject.ts`               | an alarm row on the person's object                |
| `apps/jobs/package.json`, `apps/realtime/package.json`         | a Worker: `wrangler`, no `@azure/functions`        |
| `apps/jobs/src/worker.ts`                                      | replaced by the Cron Trigger's `scheduled` handler |
| the Event Grid dead-letter replay                              | deleted                                            |
| the app-start hook                                             | deleted                                            |
| `apps/jobs/src/services/room/getRoomObject.ts`                 | calls the room's object                            |
| `apps/jobs/src/services/storage/broadcastStorageUsage.ts`      | calls the person's object                          |
| the Web PubSub client access URL                               | deleted                                            |
| the Web PubSub client                                          | deleted                                            |
