# Cloudflare Naming Conventions

This document defines the Esposter Cloudflare naming rules. They follow the [Azure naming conventions](../azure/naming-conventions.md)' shape and scanning order — environment first, asset type second, workload third — so a name read in either cloud says the same things in the same order.

## Resource Name Shape

Every resource that belongs to one environment:

```text
<environment>-<assetType>-<workload>-<purpose>
```

Account-scoped resources belong to no environment, so they drop that token, as Azure's subscription-scoped names do:

```text
<assetType>-<workload>-<purpose>
```

The purpose takes the place of Azure's index. Azure numbers interchangeable instances of one kind; a Cloudflare bucket, queue or database is one of a set the app names by what it holds, so the name carries that value — a `StorageBucket` value, a kebab-cased `QueueJob`, a database's role — and no number. Cloudflare resources are global, so there is no region token; D1 and R2 take the Oceania location hint instead (`CloudflareLocationHint`).

The shape is code, not only prose: `getCloudflareResourceName` and `getCloudflareAccountResourceName` in `packages/db-schema/src/services/cloudflare/` build every name, and both Pulumi and the Workers call them, so a resource and the code naming it cannot disagree.

## Tokens

| Token      | Meaning                       |
| :--------- | :---------------------------- |
| `esposter` | Esposter application workload |

Environment (`CloudflareEnvironment`):

| Token  | Environment |
| :----- | :---------- |
| `dev`  | Development |
| `prod` | Production  |

Both environments share one account, so the token is always written: a name without one is never production by default.

Asset type (`CloudflareAssetType`):

| Token | Resource            |
| :---- | :------------------ |
| `d1`  | D1 database         |
| `dlq` | dead-letter queue   |
| `np`  | notification policy |
| `q`   | queue               |
| `r2`  | R2 bucket           |
| `tok` | API token           |
| `wkr` | Worker script       |

## Examples

| Resource          | Production                              | Development                        |
| :---------------- | :-------------------------------------- | :--------------------------------- |
| R2 bucket         | `prod-r2-esposter-message-assets`       | `dev-r2-esposter-message-assets`   |
| D1 database       | `prod-d1-esposter-core`                 | `dev-d1-esposter-streams`          |
| Queue             | `prod-q-esposter-delete-account`        | `dev-q-esposter-process-webhook`   |
| Dead-letter queue | `prod-dlq-esposter-delete-account`      | `dev-dlq-esposter-process-webhook` |
| Worker            | `prod-wkr-esposter-web`                 | `dev-wkr-esposter-functions`       |
| API token         | `tok-esposter-infra`, `tok-esposter-r2` | —                                  |
| Notification      | `np-esposter-billing`                   | —                                  |

The longest name, `prod-dlq-esposter-reconcile-storage-ledger-entry`, is well inside the 63-character limit buckets and queues share.

## Hostnames

Hostnames are not resource names and keep their own shape: `esposter.com` and `assets.esposter.com` in production, `dev.esposter.com` and `assets.dev.esposter.com` in development, and `next.esposter.com` for the cutover's staging Worker.

## Bindings

A binding is the name code reads a resource by, and it is the same in both environments, so no code branches on the environment to reach a resource: the SCREAMING_SNAKE of the purpose — `MESSAGE_ASSETS`, `CORE`, `STREAMS`, `DELETE_ACCOUNT_QUEUE` — plus `SCHEDULER` and `SERVER` for the two Durable Object namespaces. Only a Wrangler environment block maps a binding to its environment's resource name.

## Pulumi

- The Pulumi logical name is the Cloudflare name, as it is for Azure, so a preview names the real resource and an alias can never serve a rename.
- One resource per file; the file and its single export are the camelCase of the name (`prod-r2-esposter-message-assets` is `prodR2EsposterMessageAssets.ts`).
- A child resource takes its parent's name with the child's resource type as a suffix (`prodR2EsposterMessageAssetsLifecycle`, `prodQEsposterDeleteAccountConsumer`).
- Each resource's folder is its provider type: `r2Buckets`, `r2BucketLifecycles`, `r2BucketEventNotifications`, `d1Databases`, `queues`, `queueConsumers`, `workersCustomDomains`, `notificationPolicies`, `zones`, `dnsRecords`.
