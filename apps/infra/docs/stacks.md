# Pulumi Stacks

Pulumi stacks are isolated state and configuration records for the same Pulumi program. A stack name does not automatically filter which Azure resources are managed.

## Current State

One unified stack owns all Azure resources in the subscription. Both development (`dev-*`) and production (`prod-*`) resources are declared together in the Pulumi program.

The stack is named `prod`.

## Secrets

Every secret the stack reads lives in the `esposter-infra/prod` ESC environment, under `pulumiConfig.esposter-infra:<NAME>`, and `Pulumi.prod.yaml` imports it with its `environment:` key. `configuration.requireSecret("<NAME>")` in the program resolves from there.

Add one with:

```sh
pulumi env set esposter-infra/prod pulumiConfig.esposter-infra:<NAME> <value> --secret
```

**Never `pulumi config set --secret`.** That writes the ciphertext into `Pulumi.prod.yaml`, which is tracked in a public repository — publishing the encrypted secret to everybody and betting it on one algorithm, one key, and however long the repository outlives them. Nothing is gained: the stack already reads ESC. `scripts/src/workspace/stackConfig.test.ts` fails the build on any stack file carrying an encrypted value.

## Cloudflare

The Cloudflare provider reads its API token from `cloudflare:apiToken`, the one key outside the `esposter-infra:` namespace. The token is also written to the `CLOUDFLARE_API_TOKEN` Actions secret the deploy job uses. The account id and the billing alert's address are plain values in the same environment; the zone is declared by the program, so no zone id is set:

```sh
pulumi env set esposter-infra/prod pulumiConfig.cloudflare:apiToken <token> --secret
pulumi env set esposter-infra/prod pulumiConfig.esposter-infra:cloudflareAccountId <account-id>
pulumi env set esposter-infra/prod pulumiConfig.esposter-infra:cloudflareBillingAlertEmail <email>
```

Every Cloudflare resource name is built by `getCloudflareResourceName` and `getCloudflareAccountResourceName` (`apps/infra/docs/cloudflare/naming-conventions.md`), and a Pulumi logical name is that name. A resource applied under a different name previews as a delete and a create, and `protect: true` blocks the delete. Those resources hold data, so the move is the create, cutover and delete sequence on the pulumi-infra migrations page, not an alias.

### First deploy

The web and functions Workers must exist before a Workers custom domain or a queue consumer can name them, so the first apply is three steps. Queue consumers and Workers custom domains are the two resource types excluded from the first two:

1. `pnpm infra:up` with `--exclude` on the queue consumers and the custom domains. Pulumi creates the zone, its DNS records and ruleset, the R2 buckets, D1 databases, queues, dead-letter queues, bucket notifications and the billing alert.
2. Wrangler deploys both Workers, `pnpm -C apps/web deploy:worker` and `pnpm -C apps/functions deploy:worker`, which the deploy job runs on `main` and `ai/queue`.
3. `pnpm infra:up` again without `--exclude`. Pulumi creates the queue consumers, now that the functions Worker exists, and the custom domains, now that the web Worker does.

Step 1 excludes by URN type, so the exclusion holds for every instance of the type: `--exclude "**cloudflare:index/queueConsumer:QueueConsumer**" --exclude "**cloudflare:index/workersCustomDomain:WorkersCustomDomain**"`.

## Rule Of Thumb

Only run `pulumi up` after reading the preview and confirming the selected stack owns exactly the resources you intend to change.

Never use `pulumi up --skip-preview`. If an update partially succeeds or fails, run `pnpm infra:preview` again before any follow-up apply.
