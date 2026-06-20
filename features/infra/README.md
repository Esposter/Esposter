# Infrastructure

Azure infrastructure as Pulumi (`packages/infra`), one `prod` stack managing both dev and prod resource groups, plus GitHub repository settings. Cost-guarded by `$0.01` budgets that auto-stop functions and Event Grid subscriptions the moment anything exits the free tier.

This README is the index. Durable infra docs live in [`packages/infra/docs/`](../../packages/infra/docs); reusable Pulumi conventions live in the `pulumi-infra` skill. Nothing is duplicated here.

## Now

- ✅ Migration complete. No active wave. Forward items (smoke-test loose ends + deferred hardening) are tracked in **[roadmap.md](roadmap.md)** — all deferred-with-trigger, nothing in flight.

## Shipped

Chronological. Detail lives in the linked reference docs and `packages/infra/docs/`.

- **Pulumi adoption** — imported the manually-created Azure resources into Pulumi (one resource per file, `protect: true`). → [reference/azure-pulumi-migration.md](reference/azure-pulumi-migration.md)
- **Posture review** — phase-2 cost / security / network / identity review; recorded constraints and follow-ups. → [reference/optimization-review.md](reference/optimization-review.md)
- **Safe cleanup** — Web PubSub trace ACL (blocked: Azure rejects ACL changes on `Free_F1`), Speech `Application` tag corrected.
- **Storage safety** — disabled blob versioning (unused, paid), kept 7-day blob/container soft delete, kept `Standard_LRS`.
- **Observability cost controls** — `$0.01` guard budgets → Logic App stop/delete automation; 30-day Log Analytics / 90-day App Insights retention.
- **Workflow review** — mapped Function/Logic/API-connection/Event Grid automation; stop-start + delete-restore free-tier guard cycle.
- **Managed identity / RBAC** — Azure Functions use `DefaultAzureCredential` with least-privilege role assignments adopted into Pulumi; Railway-hosted app stays key-based (no Azure MSI path).
- **Stack rename + naming convention** — `dev` stack → `prod`; adopted CAF-aligned naming in [`docs/azure/naming-conventions.md`](../../packages/infra/docs/azure/naming-conventions.md).
- **Naming migration** — migrated all dev + prod resources (stateless, stateful, monitoring) to the CAF convention with `parent` hierarchy, including storage/table/search data migration and Railway endpoint cutover.
- **Provider split + GitHub** — split `src/azure/`; added `@pulumi/github` managing repo settings, labels, environments, and secrets (via ESC); migrated branch protection to a single `develop`+`main` ruleset with `required_approving_review_count: 0`.

## Decisions

Infra's deferred-hardening and "do not change yet" decisions are **not duplicated here** — they live where the code references them:

- [`packages/infra/docs/azure/security-constraints.md`](../../packages/infra/docs/azure/security-constraints.md) — hardening blockers + the app code paths gating each one.
- [reference/optimization-review.md](reference/optimization-review.md) — follow-up candidates with rationale.

## Reference

- [`packages/infra/docs/`](../../packages/infra/docs) — naming conventions, security constraints, search indexes, overview, stacks, roadmap.
- [reference/](reference) — completed migration/review records (Pulumi adoption, optimization review).
- `pulumi-infra` skill — resource-file conventions, parent hierarchy, Output-vs-string, provider imports, verification flow.
