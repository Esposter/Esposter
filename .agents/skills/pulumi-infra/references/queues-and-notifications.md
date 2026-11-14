# Queues, consumers and R2 notifications

Read when a job's messages reach its dead-letter queue, a consumer or an R2 notification names a Worker or queue that is being renamed, or a consumer's Worker is deployed but its jobs run nothing.

## One queue and dead-letter queue per job, one consumer per queue

Each `QueueJob` has a queue (`cloudflare.Queue`, `prod-q-esposter-<job>`) and a dead-letter queue beside it (`prod-dlq-esposter-<job>`), declared under `src/cloudflare/resources/queues/`. The queue's consumer (`cloudflare.QueueConsumer`, logical name `<queue>-consumer`, under `queueConsumers/`) names the functions Worker's script as `scriptName`, the queue as `queueId` and the dead-letter queue as `deadLetterQueue`.

Its retries are two settings. `maxRetries` is the job's entry in `QueueJobMaxRetriesMap`, the number of redeliveries before the message goes to the dead-letter queue, and `retryDelay` is `QueueConsumerRetryDelay`, the wait before each one. A job whose entry is `0` (`ProcessWebhook`) goes to its dead-letter queue on its first failure.

The consumer waits for the functions Worker's first deploy, and so do the Workers custom domains for the web Worker (`apps/infra/docs/stacks.md`, "First deploy").

## A batch's queue must name a job or its dead-letter queue

`getQueueMessageHandler` (`apps/functions/src/services/queue/getQueueMessageHandler.ts`) finds a batch's job by building each job's queue name, and each job's dead-letter queue name, in this environment's spelling and comparing them with the batch's `queue`. A queue name is handled by its job's handler; a dead-letter queue name by the dead-letter replay for its job. A batch that names neither throws, so its messages retry and then dead-letter. A consumer delivering to a queue no job names reads as deployed while nothing runs.

## Each message is acknowledged or retried alone

A message is acknowledged when its job's handler resolves and retried when it throws. The failure is logged once with `console.error` in the same batch handler (`.agents/skills/error-handling/references/logging-sinks.md`), and a message that exhausts its retries is the dead-letter queue's. A dead letter is settled the same way by its replay: acknowledged once it is republished or quarantined, retried when the republish throws.

## Dead letters are replayed, then quarantined

Each job's dead-letter queue has its own consumer, `cloudflare.QueueConsumer` with logical name `<dead-letter-queue>-consumer` under `queueConsumers/`, `queueId` the dead-letter queue, `scriptName` the functions Worker and no `deadLetterQueue`. Its `maxRetries` is `DeadLetterConsumerMaxRetries` and its `retryDelay` is `QueueConsumerRetryDelay`. A dead-letter queue has no dead-letter queue of its own, so a replay that still throws after its retries is dropped.

The functions Worker's replay (`apps/functions/src/services/queue/handleDeadLetterMessage.ts`) handles each message alone. It parses the body with its job's schema, and a body that fails it, or whose `attempt` has reached `MAX_DEAD_LETTER_ATTEMPTS`, is quarantined: written create-only as its raw body to `quarantine/<queue>/<id>.json` in the private `user-assets` bucket, and logged once with `console.error`. Any other dead letter is republished to its job's queue with `attempt` raised. Nothing alerts off the quarantine (observability is off, `openspec/specs/infra/observability/design.md`), so read its prefix by hand when a job fails repeatedly.

`apps/functions/wrangler.jsonc` declares the same consumers in both environments, and a producer for every job's queue, since the replay republishes through the functions Worker's bindings. The retry settings are written there with the values the Pulumi consumers carry, so whichever applies last leaves the same settings. `apps/functions/src/wrangler.test.ts` checks the queue names in both.

## R2 notifications send bucket events to a queue

`cloudflare.R2BucketEventNotification` sends a bucket's object-creation events (`PutObject`, `CopyObject`) to a queue, and is a child of its bucket. The message-assets and resource-assets buckets notify `prod-q-esposter-reconcile-storage-ledger-entry`; the public user-assets bucket notifies `prod-q-esposter-delete-orphaned-profile-image`. Each notification's `queueId` is the queue's output, so the notification waits for the queue it names.

## A rename replaces what it names

A queue's name is its Pulumi logical name, so renaming a queue replaces it and every consumer and notification that names it. A queue holds messages, so the rename takes the two-phase sequence in `references/migrations.md`, and the consumer's `scriptName` is corrected in place by the preview like any other string a resource's properties point at.
