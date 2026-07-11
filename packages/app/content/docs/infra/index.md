---
title: Infra
description: Azure infrastructure managed as Pulumi code — one prod stack covering dev and prod resource groups, a cost-guarded free-tier posture, and GitHub repository settings.
---

# Infra

`packages/infra` manages Esposter's cloud footprint as Pulumi TypeScript. A single `prod` stack owns both the development and production Azure resource groups plus the GitHub repository settings (labels, environments, secrets, branch rulesets). Everything runs on free or near-free SKUs, and the whole estate is cost-guarded: `$0.01` budgets trigger Logic App automation that stops Function Apps and deletes Event Grid subscriptions the moment anything exits the free tier.

- [Azure Pulumi migration](/docs/infra/azure-pulumi-migration) — how resources are laid out in Pulumi: one resource per file, ARM-aligned paths, provider split, naming convention.
- [Optimization review](/docs/infra/optimization-review) — the cost/security posture: the budget guard cycle, retention settings, and why each hardening step is deliberately deferred.
- [Roadmap](/docs/infra/roadmap) — open items (observability caps, dead-lettering, key-auth-gated hardening); every item links its proposal.
- [Deferred](/docs/infra/deferred) — ideas waiting on a trigger.

Deeper operational reference lives beside the code in `packages/infra/docs/` (naming conventions, security constraints, search indexes, stacks), and Pulumi coding conventions live in the `pulumi-infra` skill.

## Shipped

- **Pulumi adoption** — imported the manually-created Azure resources into Pulumi (one resource per file, `protect: true`).
- **Posture review** — cost / security / network / identity review; recorded constraints and follow-ups. → /docs/infra/optimization-review
- **Safe cleanup** — Web PubSub trace ACL left as-is (Azure rejects ACL changes on `Free_F1`), Speech `Application` tag corrected.
- **Storage safety** — disabled blob versioning (unused, paid), kept 7-day blob/container soft delete, kept `Standard_LRS`.
- **Observability cost controls** — `$0.01` guard budgets wired to Logic App stop/delete automation; 30-day Log Analytics / 90-day App Insights retention.
- **Workflow review** — mapped the Function App / Logic App / API connection / Event Grid automation into the stop-start + delete-restore free-tier guard cycle.
- **Managed identity / RBAC** — Azure Functions use `DefaultAzureCredential` with least-privilege role assignments adopted into Pulumi; the Railway-hosted app stays key-based (no Azure MSI path).
- **Stack rename + naming convention** — `dev` stack renamed to `prod`; adopted the CAF-aligned naming convention (`packages/infra/docs/azure/naming-conventions.md`).
- **Naming migration** — migrated all dev + prod resources (stateless, stateful, monitoring) to the convention with `parent` hierarchy, including storage/table/search data migration and the Railway endpoint cutover.
- **Provider split + GitHub** — split `src/azure/`; added `@pulumi/github` managing repo settings, labels, environments, and secrets (via ESC); migrated branch protection to a single `develop`+`main` ruleset with `required_approving_review_count: 0`.
- **Post-migration verification** — smoke-tested uploads, messages, push, search, Web PubSub, and function processing; confirmed the prod search indexer populated `messages-index`.
