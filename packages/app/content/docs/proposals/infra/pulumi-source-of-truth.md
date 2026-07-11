---
title: Pulumi source of truth
description: Proposal — adopt Function App runtime settings and App Insights connections into Pulumi.
---

# Pulumi as Full Source of Truth

Function App runtime settings (app settings, runtime version, connection strings) and App Insights connection settings were configured by hand during earlier migrations and live outside Pulumi — the last drift surface in the estate.

## Scope

**Today:** the Function Apps' resources are Pulumi-managed, but their `siteConfig.appSettings` are partially portal-set; a `pulumi preview` cannot prove the runtime config.

**This adds:**

1. Enumerate current app settings per Function App (`az functionapp config appsettings list`), classify secret vs plain.
2. Adopt plain settings into the Pulumi `WebApp` resources; secrets flow from Pulumi ESC (the same channel already managing GitHub secrets).
3. Adopt the App Insights connection string / instrumentation wiring into the same resources.
4. `pulumi preview` must show empty diff against live; then a deliberate no-op deploy proves ownership.

## Key files

| File                                        | Change                              |
| :------------------------------------------ | :---------------------------------- |
| `packages/infra/src/azure/` (Function Apps) | appSettings + App Insights adoption |

## Notes

Import-then-own, never recreate — all resources are `protect: true`; adoption uses the existing import workflow from the [Pulumi migration](/docs/infra/azure-pulumi-migration).
