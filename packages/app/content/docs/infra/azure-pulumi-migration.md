---
title: Azure Pulumi Layout
description: How Esposter's Azure resources are managed in Pulumi — one resource per file, ARM-aligned source paths, a single prod stack, and a GitHub provider alongside Azure.
---

# Azure Pulumi Layout

All of Esposter's Azure resources — originally created by hand in the portal — were imported into Pulumi and are now declared in `packages/infra`. The package is the source of truth for roughly 70 resources spanning both the development and production resource groups, all owned by a single Pulumi stack named `prod`.

## Layout rules

- **One resource per file**, named after the Azure resource in camelCase (e.g. `devLogicEsposterAe001.ts`).
- **Source paths mirror ARM resource IDs**: `src/azure/resources/<ProviderNamespace>/<resourceType>/<resourceName>.ts`, e.g. `Microsoft.Web/sites/…`. Finding a resource in the Azure portal tells you exactly where its declaration lives.
- **`protect: true`** on imported resources so a bad refactor can't delete live infrastructure.
- **Providers are split**: `src/azure/` for Azure Native resources, `src/github/` for the `@pulumi/github` provider (collaborators, environments, labels, secrets via Pulumi ESC, and a single `develop`+`main` branch ruleset with `required_approving_review_count: 0`).
- **CAF-aligned naming** with a `parent` hierarchy — the convention is documented in `packages/infra/docs/azure/naming-conventions.md`; all dev and prod resources (stateless, stateful) follow it, after a migration that included storage/table/search data moves and the Railway endpoint cutover.
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

| File                                                | Role                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| `packages/infra/Pulumi.yaml` / `Pulumi.prod.yaml`   | Project + the single `prod` stack configuration                     |
| `packages/infra/src/azure/resources/`               | One file per Azure resource, ARM-aligned paths                      |
| `packages/infra/src/github/`                        | GitHub repository settings, labels, environments, rulesets, secrets |
| `packages/infra/docs/azure/naming-conventions.md`   | CAF-aligned naming convention reference                             |
| `packages/infra/docs/azure/security-constraints.md` | Hardening blockers and the app code paths gating each one           |

## Notes

- App-plane settings were the last gap the import left open, and they are now closed: each Function App's runtime settings live in its `WebApp` declaration — see [Pulumi source of truth](/docs/infra/pulumi-source-of-truth).
- The tag policy assignment was renamed onto the naming convention (`pa-require-application-tag` → `pa-esposter-001`), which is a replace, not an update. `protect: true` stays on the declaration, so the delete half needs one operator step first: `pulumi state unprotect "<old-urn>"`, then a single `pulumi up` deletes the old assignment and creates the renamed one. Without it the update aborts on the protected resource and nothing else in the plan lands either.
- The import-era scaffolding (the `packages/infra/data/` CSV asset inventory and the `buildAzureImportManifest` generator) has been deleted now that the import is done — `packages/infra/data/` holds only the `messages-index` search index definition.
