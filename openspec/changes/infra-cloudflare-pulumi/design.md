# Cloudflare Pulumi

Part of the [Cloudflare program](../infra-cloudflare-program/design.md). `apps/infra` gains a `cloudflare` provider folder beside `azure` and `github`; Wrangler deploys the two Workers' code from CI.

## Resources

`src/cloudflare/resources/` follows the estate's one-resource-per-file rule, foldered by the provider's resource type:

- `r2Buckets/` — one per `StorageBucket`, prod and dev, with the `message-assets` lifecycle rule and the custom domain for the public buckets.
- `d1Databases/` — `core`, prod and dev.
- `queues/` — one per `QueueJob` plus its dead-letter queue, prod and dev; the R2 event notifications that feed the reconcile and orphaned-image queues.
- `workersCustomDomains/` — `esposter.com` to the prod web Worker, the develop hostname to the dev one.
- `realtimeKitApps/` — the RealtimeKit app, if the provider declares one; otherwise the app is created once by its API and its id is a secret.
- `notificationPolicies/` — billing usage alerts on the paid plan, replacing the Azure budget guard.

The Workers themselves are not Pulumi resources: Nitro writes the web Worker's `wrangler.json` and the functions Worker has its own, both naming the binding ids Pulumi exports. The secrets (R2 API token, VAPID keys, auth secrets, RealtimeKit key) live in the `esposter-infra/prod` ESC environment, and CI writes them with `wrangler secret put` at deploy.

## Deploy

A `deploy` job in CI runs on `main` after the checks pass, builds the app and runs `wrangler deploy` for the web and functions Workers, then applies pending D1 migrations with `wrangler d1 migrations apply`. `ai/queue` deploys the dev Workers the same way. The job's Cloudflare token is a GitHub secret declared in `src/github/secrets`.

## Key files

| File                              | Role after the change            |
| :-------------------------------- | :------------------------------- |
| `apps/infra/src/index.ts`         | exports the Cloudflare resources |
| `apps/infra/src/configuration.ts` | the Cloudflare account id        |
| `apps/infra/package.json`         | `@pulumi/cloudflare`             |
| `apps/infra/src/github/secrets`   | the Cloudflare deploy token      |
| `.github/workflows/CI.yaml`       | the deploy job                   |
