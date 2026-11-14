# Cloudflare jobs

Part of the [Cloudflare program](../infra-cloudflare-program/design.md). `apps/functions` becomes a Worker that consumes one Queue per job, runs the nightly purge on a Cron Trigger and exports the per-room, per-call and per-person objects of the [realtime](../infra-cloudflare-realtime/design.md) design, whose alarms run delayed work.

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
| `ReplayDeadLetterEvent`                          | deleted: each queue's dead-letter queue keeps what failed                                    |

The queue consumer is the functions Worker's `queue(batch, env)` handler, dispatching on the batch's queue name to the handler the Function wrapper called; the handlers under `src/handlers` keep their bodies. A message is acknowledged when its handler resolves and retried when it throws, up to the job's retry count, then sent to the job's dead-letter queue. `AzureFunctionIsIdempotentMap` becomes the per-queue retry count: a non-idempotent job (`ProcessWebhook`) gets no retry. Event Grid's envelope (`createEventGridEvent`) is replaced by the job's payload, parsed with its existing Zod schema on receipt. R2's notification body is parsed with its own schema, replacing `blobCreatedEventGridDataSchema`.

## Scheduled work and live state

A scheduled message and a TodoList reminder are alarms on the object that owns them — the room's and the person's — and a consumer that changes live state calls the owning object's RPC method; the [realtime](../infra-cloudflare-realtime/design.md) design holds both. The jobs that remain are the queue jobs above and the nightly purge.

## Key files

| File                                                                           | Role after the change                              |
| :----------------------------------------------------------------------------- | :------------------------------------------------- |
| `packages/db-schema/src/models/azure/function/AzureFunction.ts`                | renamed to the queue job enum                      |
| `packages/db-schema/src/services/azure/eventGrid/publishNotification.ts`       | sends to the notification queue                    |
| `packages/db-schema/src/services/azure/eventGrid/createEventGridEvent.ts`      | deleted                                            |
| `packages/db/src/services/azure/serviceBus/enqueueScheduledMessageJob.ts`      | an alarm row on the room's object                  |
| `packages/db/src/services/azure/serviceBus/enqueueTodoReminder.ts`             | an alarm row on the person's object                |
| `apps/functions/package.json`                                                  | a Worker: `wrangler`, no `@azure/functions`        |
| `apps/functions/src/functions/purgeDeletedResources.ts`                        | replaced by the Cron Trigger's `scheduled` handler |
| `apps/functions/src/functions/replayDeadLetterEvent.ts`                        | deleted                                            |
| `apps/functions/src/hooks/appStart.ts`                                         | deleted                                            |
| `apps/functions/src/services/message/createAndBroadcastMessage.ts`             | calls the room's object                            |
| `apps/functions/src/services/storage/broadcastStorageUsage.ts`                 | calls the person's object                          |
| `apps/web/server/services/azure/webPubSub/generateWebPubSubClientAccessUrl.ts` | deleted                                            |
| `apps/web/app/services/azure/webPubSub/startWebPubSubClient.ts`                | deleted                                            |
