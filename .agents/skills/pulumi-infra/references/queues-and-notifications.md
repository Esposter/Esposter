# Queues, consumers and R2 notifications

Read when a job's messages reach its dead-letter queue, a consumer or an R2 notification names a Worker or queue that is being renamed, or a consumer's Worker is deployed but its jobs run nothing.

## One queue and dead-letter queue per job, one consumer per queue

Each `QueueJob` has a queue (`cloudflare.Queue`, `prod-q-esposter-<job>`) and a dead-letter queue beside it (`prod-dlq-esposter-<job>`), declared under `src/cloudflare/resources/queues/`. The queue's consumer (`cloudflare.QueueConsumer`, logical name `<queue>-consumer`, under `queueConsumers/`) names the jobs Worker's script as `scriptName`, the queue as `queueId` and the dead-letter queue as `deadLetterQueue`.

A consumer takes its queue and dead-letter queue from one entry of `queueJobResources` (`apps/infra/src/cloudflare/services/queueJobResources.ts`), keyed by environment and job, so the pair is written once and a consumer cannot pair a queue with another job's dead letters.

Its retries are two settings. `maxRetries` is the job's entry in `QueueJobMaxRetriesMap`, the number of redeliveries before the message goes to the dead-letter queue, and `retryDelay` is `QueueConsumerRetryDelay`, the wait before each one. A job whose entry is `0` (`ProcessWebhook`) goes to its dead-letter queue on its first failure.

The consumer waits for the jobs Worker's first deploy, which `references/operations.md` holds back with `--exclude`.

## A batch's queue must name a job or its dead-letter queue

`getQueueMessageHandler` (`apps/jobs/src/services/queue/getQueueMessageHandler.ts`) finds a batch's job by building each job's queue name, and each job's dead-letter queue name, in this environment's spelling and comparing them with the batch's `queue`. A queue name is handled by its job's handler; a dead-letter queue name by the dead-letter replay for its job. A batch that names neither throws, so its messages retry and then dead-letter. A consumer delivering to a queue no job names reads as deployed while nothing runs.

## Each message is acknowledged or retried alone

The failure is logged once with `console.error` in the same batch handler (`.agents/skills/error-handling/references/logging-sinks.md`); how a message is acknowledged, retried or dead-lettered is `openspec/specs/architecture/cloudflare-services/design.md`'s.

## Dead letters are replayed, then quarantined

Each job's dead-letter queue has its own consumer, `cloudflare.QueueConsumer` with logical name `<dead-letter-queue>-consumer` under `queueConsumers/`, `queueId` the dead-letter queue, `scriptName` the jobs Worker and no `deadLetterQueue`. Its `maxRetries` is `DEAD_LETTER_CONSUMER_MAX_RETRIES` from `@esposter/db-schema`, which the replay reads too, and its `retryDelay` is `QueueConsumerRetryDelay`. A dead-letter queue has no dead-letter queue of its own, which is why the replay never leaves the last delivery to the queue.

The replay's rules are `openspec/specs/architecture/cloudflare-services/design.md`'s, read against `apps/jobs/src/services/queue/handleDeadLetterMessage.ts`; the one detail that page does not hold is that a quarantine is written create-only.

Pulumi owns every queue consumer, as it does for the job queues. `apps/jobs/wrangler.jsonc` declares only the producers, one per job's queue, since the replay republishes through the jobs Worker's bindings. `apps/jobs/src/wrangler.test.ts` checks those producers by queue name.

## R2 notifications send bucket events to a queue

`cloudflare.R2BucketEventNotification` sends a bucket's object-creation events (`PutObject`, `CopyObject`) to a queue, and is a child of its bucket. The message-assets and resource-assets buckets notify `prod-q-esposter-reconcile-storage-ledger-entry`; the public user-assets bucket notifies `prod-q-esposter-delete-orphaned-profile-image`. Each notification's `queueId` is the queue's output, so the notification waits for the queue it names.

## A rename replaces what it names

A queue's name is its Pulumi logical name, so renaming a queue replaces it and every consumer and notification that names it. A queue holds messages, so the rename takes the two-phase sequence in `references/migrations.md`.

A consumer's Worker is fixed once the consumer exists. The Queues API answers a `scriptName` change with success and leaves the old script in place, and the provider plans it as an in-place update, so the preview and the apply both read clean while the queue still delivers to the old Worker. Moving a consumer to another Worker is a delete and a create: delete the consumer through the API (`DELETE /queues/<queue id>/consumers/<consumer id>`), unprotect and `pulumi state delete` its URN, then a targeted `up` creates it on the new script. A queue has one consumer at a time, so the create cannot run before the delete. Check the result with `GET /queues`, whose `consumers[].script` is the truth, before deleting the old Worker.
