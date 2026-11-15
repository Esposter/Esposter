# Cloudflare program

## Why

Esposter runs on two clouds and a container host. The Nuxt server, Postgres and the self-hosted LiveKit stack run on Railway; Blob and Table Storage, AI Search, Functions, Event Grid, Service Bus and Web PubSub run on Azure. Railway routes no UDP, so calls run over a TCP proxy and HAProxy forward that was only ever meant to be interim. The Azure half is a dozen services held on their free SKUs by a budget guard of Logic Apps that switches them off when anything is billed, with a dead-letter subsystem of our own and a mock package that mirrors every one of them in tests.

Cloudflare's developer platform covers every one of those jobs inside one account and one Pulumi provider: a Worker serves the app, a Durable Object holds what today relies on one long-lived process, D1 holds the data, R2 the files, Queues the async work, alarms the delayed work and Realtime the calls. The program moves the code onto it, so that what remains afterwards is copying the data across and switching the domain.

## What changes

The program is seven parts, each its own change with this prefix, each landing on the `ai/cloudflare` branch:

1. [Runtime](../infra-cloudflare-runtime/design.md) — the app as a Worker on Nitro's `cloudflare_module` preset, with tRPC and its WebSockets in Nitro's one Durable Object, and the server bundle trimmed to what the server runs.
2. [Database](../infra-cloudflare-database/design.md) — the Postgres schema and the Azure Table data on D1, Azure AI Search as an FTS5 index beside the messages, and the tests on Miniflare.
3. [Storage](../infra-cloudflare-storage/design.md) — every Blob container as an R2 bucket, uploads as presigned PUTs.
4. [Jobs](../infra-cloudflare-jobs/design.md) — the Functions app as a Worker consuming Queues, Service Bus delays as Durable Object alarms, the timer as a Cron Trigger, and Web PubSub replaced by calls into the app's Durable Object.
5. [Calls](../infra-cloudflare-calls/design.md) — LiveKit replaced by Cloudflare RealtimeKit.
6. [Pulumi](../infra-cloudflare-pulumi/design.md) — the Cloudflare resources in `@pulumi/cloudflare`, the code deployed by Wrangler from CI.
7. [Cutover](../infra-cloudflare-cutover/design.md) — the data copied, the domain switched, and Railway and the Azure estate torn down. Not built on the branch.

## Out of scope

- Changing any feature's behaviour beyond what a platform forces, which each part names.
- Sharding the Durable Object by room or user. The [program design](design.md) names the trigger.
