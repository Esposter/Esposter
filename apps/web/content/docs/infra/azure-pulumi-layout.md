---
title: Azure Pulumi Layout
description: How Esposter's Azure resources are managed in Pulumi — one resource per file, ARM-aligned source paths, a single prod stack, and a GitHub provider alongside Azure.
---

# Azure Pulumi Layout

Every Azure resource Esposter runs is declared in `apps/infra`, which is the source of truth for both the development and production resource groups under a single Pulumi stack named `prod`. Anything created by hand in the portal is drift, not a resource — it is imported and declared, or it is deleted.

## Layout rules

- **One resource per file**, named after the Azure resource in camelCase (e.g. `devLogicEsposterAe001.ts`).
- **Source paths mirror ARM resource IDs**: `src/azure/resources/<ProviderNamespace>/<resourceType>/<resourceName>.ts`, e.g. `Microsoft.Web/sites/…`. Finding a resource in the Azure portal tells you exactly where its declaration lives.
- **`protect: true`** on imported resources so a bad refactor can't delete live infrastructure.
- **Providers are split**: `src/azure/` for Azure Native resources, `src/github/` for the `@pulumi/github` provider (collaborators, environments, labels, secrets via Pulumi ESC, and the branch rulesets that make a branch's name the rule for who may create and push it — [branch namespaces](/docs/infra/branch-namespaces)).
- **CAF-aligned naming** with a `parent` hierarchy, documented in `apps/infra/docs/azure/naming-conventions.md` and followed by every dev and prod resource, stateless and stateful alike. Renaming a stateful resource moves its data, so the convention is applied at declaration time rather than corrected later.
- The package entrypoint `src/index.ts` is a generated ctix barrel; Pulumi executes the compiled `dist/index.js`.

## Resource inventory

What each provider namespace under `src/azure/resources/` holds:

| Namespace                  | Resources                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `Microsoft.Resources`      | Dev and prod resource groups                                                                                        |
| `Microsoft.Storage`        | Storage accounts (blobs, tables, queues)                                                                            |
| `Microsoft.Web`            | Function Apps, Dynamic Y1 hosting plans, Logic App API connections                                                  |
| `Microsoft.EventGrid`      | Topics and event subscriptions targeting the Azure Functions                                                        |
| `Microsoft.ServiceBus`     | Namespaces and queues (scheduled-message jobs)                                                                      |
| `Microsoft.SignalRService` | Web PubSub (`Free_F1`)                                                                                              |
| `Microsoft.Search`         | Cognitive Search services (free SKU)                                                                                |
| `Microsoft.Logic`          | The four guard-cycle workflows per environment (stop/start Function Apps, delete/recreate Event Grid subscriptions) |
| `Microsoft.Consumption`    | The `$0.01` guard budgets                                                                                           |
| `Microsoft.Insights`       | Budget-guard action groups (`*AgEsposter001` stop, `*AgEsposter003` delete)                                         |
| `Microsoft.Authorization`  | Least-privilege role assignments for managed identities, and the subscription policy assignment                     |

## Key files

| File                                            | Role                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------- |
| `apps/infra/Pulumi.yaml` / `Pulumi.prod.yaml`   | Project + the single `prod` stack configuration                     |
| `apps/infra/src/azure/resources/`               | One file per Azure resource, ARM-aligned paths                      |
| `apps/infra/src/github/`                        | GitHub repository settings, labels, environments, rulesets, secrets |
| `apps/infra/docs/azure/naming-conventions.md`   | CAF-aligned naming convention reference                             |
| `apps/infra/docs/azure/security-constraints.md` | Hardening blockers and the app code paths gating each one           |

## Notes

- App-plane settings are declared too: each Function App's runtime settings live in its `WebApp` declaration, so nothing about a deployed app is portal-only — see [Pulumi source of truth](/docs/infra/pulumi-source-of-truth).
- **A GitHub default is declared rather than left to the settings page.** The provider owns the repository's Actions surface beside its refs: which actions a workflow may call, the token a job is handed when its workflow declares no `permissions:` of its own — read — and Dependabot's automatic pull requests, off because Renovate writes every version here and a second bot's pull request would arrive against `main` and spend the review slot. Each has a GitHub default, and a default nobody declared is one a click flips with no diff to show for it. The exception is the `pull_request` rule's `require_extra_approval_for_unattributed_changes`, which `@pulumi/github` 6.15.0 cannot express — [branch namespaces](/docs/infra/branch-namespaces). Private vulnerability reporting is on and set on the repository directly for the same reason. Requiring every action to be pinned to a sha is deliberately not taken: the collector calls its reusable workflow at `ai/queue`, a moving ref by design, and a policy that counts a reusable workflow deadlocks every event it fires on — which no preview can prove either way.
- The one policy assignment carries the naming convention too (`pa-esposter-001`) and is `protect: true`, so renaming it is a replace whose delete half needs the operator step the `pulumi-infra` skill's `references/migrations.md` gives — without it the update aborts on the protected resource and nothing else in the plan lands either.
- Not everything in the package is a Pulumi declaration: `apps/infra/data/searchIndexes/messages-index.json` holds the Azure AI Search index schema, which is a data-plane resource recreated from that file rather than managed by the provider ([Azure services](/docs/architecture/azure-services)).
