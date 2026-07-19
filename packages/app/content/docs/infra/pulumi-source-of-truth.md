---
title: Pulumi source of truth
description: The Function Apps' runtime app settings and App Insights wiring are managed in Pulumi rather than set by hand in the portal.
---

# Pulumi As Full Source Of Truth

The Function Apps are Pulumi-managed resources, but their runtime app settings were once configured by hand in the portal during earlier migrations — the last surface where a `pulumi preview` could not prove the live configuration. Those settings are now adopted into the `WebApp` resources, so the code is the source of truth for runtime config.

## How it works

Each Function App's `siteConfig.appSettings` holds the full set of app settings, resolved from three sources by classification:

- **Plain values** — runtime version, worker runtime, storage / queue / table service URIs, the managed-identity credential marker, `BASE_URL`, the VAPID public key, and the run-from-package URL — are written as literals matching the live values.
- **Managed-resource wiring** — the App Insights connection string and instrumentation key come from the App Insights component's outputs, and the Event Grid endpoint from the Event Grid topic's output, so they track the resources Pulumi already owns.
- **Secrets** — the database URL, Event Grid key, storage / Web PubSub / Service Bus connection strings, and the VAPID private key — flow from Pulumi ESC via `config.requireSecret`, the same channel that manages the GitHub Actions secrets. No secret value lives in the code.

```mermaid
flowchart TD
  literal[Plain literals] --> app[WebApp siteConfig appSettings]
  appi[App Insights component outputs] --> app
  topic[Event Grid topic output] --> app
  esc[Pulumi ESC secrets] --> app
```

## Key files

| File                                                                            | Role                                                 |
| :------------------------------------------------------------------------------ | :--------------------------------------------------- |
| `packages/infra/src/azure/resources/Microsoft.Web/sites/devFuncEsposter001.ts`  | Dev Function App app settings + App Insights wiring  |
| `packages/infra/src/azure/resources/Microsoft.Web/sites/prodFuncEsposter001.ts` | Prod Function App app settings + App Insights wiring |

## Notes

Adoption is import-then-own — the `WebApp` resources are `protect: true` and adopting settings updates them in place rather than recreating them. The ESC environment must hold each `config.requireSecret` key with the exact live value before a deploy, so that a preview shows an empty diff and the deploy proves ownership without changing the running configuration.
