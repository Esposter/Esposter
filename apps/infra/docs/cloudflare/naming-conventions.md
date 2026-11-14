# Cloudflare Naming Conventions

The names of the Cloudflare resources `src/cloudflare/` declares, and of the Workers they route to and consume queues for.

## One Account, Two Stacks

Both stacks share one Cloudflare account, so a name prod and dev would both take is taken by prod, and dev takes a `dev-` prefix:

| Stack | Prefix | Example R2 bucket    |
| :---- | :----- | :------------------- |
| prod  | none   | `message-assets`     |
| dev   | `dev-` | `dev-message-assets` |

A prod name is the bare value the app uses: a `StorageBucket` value is its R2 bucket's name, and a queue is named for its job. The Pulumi export and file take the same name, with a `dev` prefix for dev.

## Names By Resource

| Resource              | Prod name                                                                 | Dev name                   | Pulumi logical name                |
| :-------------------- | :------------------------------------------------------------------------ | :------------------------- | :--------------------------------- |
| R2 bucket             | a `StorageBucket` value                                                   | `dev-` + the value         | `r2Bucket-<name>`                  |
| R2 lifecycle          | the bucket's own                                                          | the bucket's own           | `r2BucketLifecycle-<name>`         |
| R2 event notification | the bucket's own                                                          | the bucket's own           | `r2BucketEventNotification-<name>` |
| D1 database           | `core`, `streams`                                                         | `dev-core`, `dev-streams`  | `d1Database-<name>`                |
| Queue                 | the job's kebab-case name: `delete-account`, `process-webhook`, and so on | `dev-` + the name          | `queue-<name>`                     |
| Dead-letter queue     | the job's queue name + `-dlq`                                             | `dev-` + that name         | `queue-<name>`                     |
| Queue consumer        | the queue's own                                                           | the queue's own            | `queueConsumer-<queue name>`       |
| Workers custom domain | the hostname                                                              | the hostname               | `workersCustomDomain-<hostname>`   |
| Notification policy   | `billing-usage-alert`                                                     | the same (one per account) | `notificationPolicy-<name>`        |

The queues are the nine jobs the functions Worker consumes: `delete-account`, `delete-orphaned-profile-image`, `export-user-data`, `process-blob-deletion`, `process-notification`, `process-scheduled-message-job`, `process-webhook`, `reconcile-storage-ledger-entry` and `send-todo-reminder`.

`-dlq` is a wire name, the name the Cloudflare API and a wrangler config carry, so it keeps its short form. The file and export that declare a dead-letter queue spell it out: `deleteAccountDeadLetterQueue`.

## Worker Script Names

The four script names live in `src/cloudflare/constants/CloudflareWorkerName.ts`. A wrangler config carries the same string, as its top-level `name` for prod or its `env.dev.name` for dev:

| Worker    | Prod                 | Dev                      |
| :-------- | :------------------- | :----------------------- |
| web       | `esposter`           | `esposter-dev`           |
| functions | `esposter-functions` | `esposter-functions-dev` |

The web Worker's dev hostname is `dev.esposter.com`; the prod hostnames are `esposter.com` and `assets.esposter.com`.

## Files And Exports

- One resource per file, and the file's name is its single export's name.
- A name is camelCase of the Cloudflare name, with the `dev` prefix in front for dev (`dev-message-assets` is `devMessageAssets`).
- A child resource takes its parent's name with the child's resource type as a suffix (`messageAssetsLifecycle`, `deleteAccountQueueConsumer`).
- The barrel re-exports every module with `export *`, so an export name is unique across the whole package: a name repeated in two folders is a TypeScript ambiguity.
- Each resource's folder is its provider type, as the Azure resources are: `r2Buckets`, `r2BucketLifecycles`, `r2BucketEventNotifications`, `queues`, `queueConsumers`, `d1Databases`, `notificationPolicies`, `workersCustomDomains`.

## Shared Constants

A value two or more resource files read is a constant under `src/cloudflare/constants/`:

- `CloudflareAccountId` and `CloudflareZoneId`, read from the `cloudflareAccountId` and `cloudflareZoneId` config keys.
- `CloudflareLocationHint`, the D1 and R2 location hint (`oc`, Oceania).
- `QueueConsumerRetry`, the retry settings an idempotent job and a non-idempotent one get.
- `CloudflareWorkerName`, the script names above.
