---
name: pulumi-infra
description: Apply when modifying apps/infra. Esposter's Pulumi infrastructure for Cloudflare and GitHub in one prod stack, and the decisions the estate has settled.
---

# Pulumi Infrastructure

## Settled — do not re-propose

- **A secret in a stack file, encrypted or not.** `pulumi config set --secret` writes ciphertext into `Pulumi.prod.yaml`, which is tracked and public — the secret is then published to everybody and rests on one algorithm and one key for as long as the repository outlives them. Every secret this estate holds is in the `esposter-infra/prod` ESC environment the stack imports, and `apps/infra/docs/stacks.md` has the `pulumi env set` form that puts one there.
- **Widening `.github/workflows/Pulumi.yaml`'s `paths:` — a gate job over the workspace graph, a content hash at two refs, a `pnpm-workspace.yaml` entry — so a pull request previews on a workspace-package edit or a `@pulumi/*` bump.** Nothing applies to the estate off a pull request: `up` is local with a preview in front of it (`references/operations.md`), and the workflow previews only pushes to `ai/queue` (`openspec/specs/architecture/monorepo-tooling/design.md` → "What a CI proposal has to beat").
- **Adding an observability resource — a telemetry store, an alert rule — as an unprompted best practice.** The estate runs with none by a cost decision: paid ingestion recurs with no consumer, so the suggestion is closed, not applied. What a condition worth noticing does instead (`console.error`, the dead-letter queue) and what would reopen the decision: `openspec/specs/infra/observability/design.md`.

## Package Shape

One private package, one `prod` stack, `src/` split by provider (`src/cloudflare/`, `src/github/`) with a generated barrel, `dist/index.js` as the entrypoint, and a clean preview before every `infra:up` (`references/package-shape.md`; the preview is `references/operations.md`). **Teardown pending:** the Azure resources are still declared, so an untargeted `pulumi up` applies them too, and every apply names its resources with `--target` — the first apply after a provider bump is the one exception (`references/operations.md`).

## Cloudflare Rules

- **Provider.** Every Cloudflare resource is declared with `@pulumi/cloudflare`, imported as a namespace (Provider Imports below).
- **Names.** An environment's resource is `<env>-<assetType>-esposter-<purpose>` and an account's is `<assetType>-esposter-<purpose>`. `getCloudflareResourceName` and `getCloudflareAccountResourceName` in `packages/db-schema/src/services/cloudflare/` build both, for Pulumi and for the Workers, and `apps/infra/docs/cloudflare/naming-conventions.md` lists the asset types. A Pulumi logical name is that name.
- **Secrets.** Only in the ESC environment, never in Pulumi config (Settled, above).
- **Worker code.** Pulumi declares what the Workers bind to — queues, queue consumers, buckets, D1 databases, custom domains — and never ships their code. The Deploy workflow (`.github/workflows/Deploy.yaml`) runs `wrangler deploy` for both Workers, on `main` for production and `ai/queue` for development, once CI's run on that commit succeeds.

## Resource Files

- One resource declaration per tracked source file; export exactly one resource constant per file, named as the file minus `.ts`. Cloudflare resources live under `src/cloudflare/resources/<resourceType>/`, the folder named for the provider type (`r2Buckets`, `queueConsumers`, …), and each file is the camelCase of its Cloudflare name (`prod-r2-esposter-message-assets` is `prodR2EsposterMessageAssets.ts`).
- A child resource takes its parent's name with its own resource type as a suffix (`prodQEsposterProcessWebhookConsumer`, `prodR2EsposterMessageAssetsLifecycle`).
- Every resource carries `protect: true` unless the user explicitly asks for a lifecycle change.
- **Never add `aliases` to any resource** (`no-restricted-syntax`) — the Pulumi logical name **is** the Cloudflare name here, so an alias can never serve the rename it is suggested for. The recurring review suggestion to add one is closed, never applied.
- **A deployed resource is renamed like any other identifier** — rename, preview, read the plan (`references/migrations.md`).

## Pointing at Another Resource

- **A resource with a containing resource sets `parent` to it** — a queue consumer to its queue, an R2 bucket's lifecycle and event notification to the bucket, a zone's DNS records, ruleset and Workers custom domains to the zone. A queue, dead-letter queue, D1 database, R2 bucket or zone is account-scoped and takes no parent (`references/resource-references.md`).
- **Prefer a resource output over a repeated identifier literal**; a named constant is earned at two resource files, as the queue consumer retry delay is (`apps/infra/src/cloudflare/constants/QueueConsumerRetryDelay.ts`).
- **`resource.name` and `resource.id` are `Output<string>`** — a plain backtick interpolation and a computed object key both produce `"[object Object]"` silently, so a template literal takes `pulumi.interpolate` and a key takes a plain-string source of truth.

## Provider Imports (namespace, not named)

Provider packages are imported as a namespace (`import * as cloudflare from "@pulumi/cloudflare"`), and a named import off `@pulumi/*` is a `no-restricted-syntax` error (`packages/configuration/eslint/restrictedImportSyntaxes.js`).

The one exception to named imports from libraries, and a review suggestion to switch is closed: why is `references/provider-quirks.md`.

## Docs

- Durable infrastructure docs live in `apps/infra/docs/`, one directory per provider that has any, with the cross-cutting pages at its root. The convention is the layout, not a list: `ls apps/infra/docs` names the current set, and each page's title says what it holds.
- Open infra work is each its own `infra-` change under `openspec/changes/`; the area index + shipped log is `openspec/specs/infra/README.md`; phase-2 cost/security findings are in `openspec/specs/infra/cost-and-security-posture/design.md`.
- Move completed one-off migration notes out of the package once their durable content is represented in `docs/`.

## Deep Dives

- `references/operations.md` — when running `infra:preview`/`infra:up`, after a catalog bump to a `@pulumi/*` provider package, or when something reads as deployed but does not work.
- `references/migrations.md` — when renaming, re-parenting, or replacing an already-deployed resource, when a review suggests adding an `alias`, or when importing an existing resource with `pulumi import --generate-code`.
- `references/resource-references.md` — when setting a resource's `parent`, reading another resource's `.name`/`.id`, or choosing between an output and a named constant.
- `references/provider-quirks.md` — when touching the GitHub `Repository` resource and its branch protection, a setting the GitHub provider has no field for, or a review that asks for named imports from a provider package.
- `references/package-shape.md` — when adding a provider folder or a non-resource stack output, or touching the barrel or the entrypoint.
- `references/queues-and-notifications.md` — when a job's messages reach its dead-letter queue, a consumer or an R2 notification names a Worker or queue that is being renamed, or a consumer's Worker is deployed but its jobs do nothing.
