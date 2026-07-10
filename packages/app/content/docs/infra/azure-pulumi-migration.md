---
title: Azure Pulumi Layout
description: How Esposter's Azure resources are managed in Pulumi — one resource per file, ARM-aligned source paths, a single prod stack, and a GitHub provider alongside Azure.
---

# Azure Pulumi Layout

All of Esposter's Azure resources — originally created by hand in the portal — were imported into Pulumi and are now declared in `packages/infra`. The package is the source of truth for roughly 95 resources spanning both the development and production resource groups, all owned by a single Pulumi stack named `prod`.

## Layout rules

- **One resource per file**, named after the Azure resource in camelCase (e.g. `devLogicEsposterAe001.ts`).
- **Source paths mirror ARM resource IDs**: `src/azure/resources/<ProviderNamespace>/<resourceType>/<resourceName>.ts`, e.g. `Microsoft.Web/sites/…`. Finding a resource in the Azure portal tells you exactly where its declaration lives.
- **`protect: true`** on imported resources so a bad refactor can't delete live infrastructure.
- **Providers are split**: `src/azure/` for Azure Native resources, `src/github/` for the `@pulumi/github` provider (collaborators, environments, labels, secrets via Pulumi ESC, and a single `develop`+`main` branch ruleset with `required_approving_review_count: 0`).
- **CAF-aligned naming** with a `parent` hierarchy — the convention is documented in `packages/infra/docs/azure/naming-conventions.md`; all dev and prod resources (stateless, stateful, monitoring) follow it, after a migration that included storage/table/search data moves and the Railway endpoint cutover.
- The package entrypoint `src/index.ts` is a generated ctix barrel; Pulumi executes the compiled `dist/index.js`.

## Resource inventory

What each provider namespace under `src/azure/resources/` holds:

| Namespace                                                          | Resources                                                                                                           |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `Microsoft.Resources`                                              | Dev and prod resource groups                                                                                        |
| `Microsoft.Storage`                                                | Storage accounts (blobs, tables, queues)                                                                            |
| `Microsoft.Web`                                                    | Function Apps, Dynamic Y1 hosting plans, Logic App API connections                                                  |
| `Microsoft.EventGrid`                                              | Topics and event subscriptions targeting the Azure Functions                                                        |
| `Microsoft.ServiceBus`                                             | Namespaces and queues (scheduled-message jobs)                                                                      |
| `Microsoft.SignalRService`                                         | Web PubSub (`Free_F1`)                                                                                              |
| `Microsoft.Search`                                                 | Cognitive Search services (free SKU)                                                                                |
| `Microsoft.Logic`                                                  | The four guard-cycle workflows per environment (stop/start Function Apps, delete/recreate Event Grid subscriptions) |
| `Microsoft.Consumption`                                            | The `$0.01` guard budgets                                                                                           |
| `Microsoft.Insights`                                               | Application Insights components and action groups                                                                   |
| `Microsoft.OperationalInsights` / `Microsoft.OperationsManagement` | Log Analytics workspaces and solutions                                                                              |
| `Microsoft.AlertsManagement`                                       | Alert processing rules                                                                                              |
| `Microsoft.Authorization`                                          | Least-privilege role assignments for managed identities                                                             |

## Key files

| File                                                | Role                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| `packages/infra/Pulumi.yaml` / `Pulumi.prod.yaml`   | Project + the single `prod` stack configuration                     |
| `packages/infra/src/azure/resources/`               | One file per Azure resource, ARM-aligned paths                      |
| `packages/infra/src/github/`                        | GitHub repository settings, labels, environments, rulesets, secrets |
| `packages/infra/docs/azure/naming-conventions.md`   | CAF-aligned naming convention reference                             |
| `packages/infra/docs/azure/security-constraints.md` | Hardening blockers and the app code paths gating each one           |

## Notes

- App-plane settings are not fully represented: Function App runtime settings and App Insights connection settings remain external to the imported `WebApp` declarations (open roadmap item — see /docs/infra/roadmap).
- The import-era artifacts (`packages/infra/data/` CSV inventory and the import manifest generator) were migration scaffolding; the declared end state is their removal once no longer needed as import evidence.
