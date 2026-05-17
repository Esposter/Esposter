# Infrastructure Overview

This document captures the phase-1 imported Azure resource set.

Pulumi currently has 47 tracked source files under `src/resources/`. The original spreadsheet contained 51 rows. The four Azure Monitor action rows are not standalone imported resources; they are represented by the imported action groups and their receivers.

## Summary By Environment

| Environment | Prefix | Spreadsheet Rows |
| ----------- | ------ | ---------------: |
| Development | `d`    |               26 |
| Production  | `p`    |               25 |

The current Pulumi program declares both development and production resources.

## Summary By Asset Type

| Asset Type                      | Count |
| ------------------------------- | ----: |
| API connection                  |     8 |
| Application Insights            |     2 |
| Azure Cognitive Search          |     2 |
| Azure Cognitive Speech Services |     1 |
| Azure Monitor action            |     4 |
| Azure Monitor action group      |     6 |
| Budget                          |     4 |
| Event Grid Topic                |     2 |
| Event Grid Topic Subscription   |     4 |
| Function app                    |     2 |
| Log Analytics workspace         |     2 |
| Logic apps                      |     8 |
| Resource group                  |     2 |
| Storage account                 |     2 |
| Web PubSub                      |     2 |

## Source Tree

Resource files are grouped by Azure ARM provider namespace and resource type:

| Azure ARM Type                             | Source Folder                                             |
| ------------------------------------------ | --------------------------------------------------------- |
| `Microsoft.CognitiveServices/accounts`     | `src/resources/Microsoft.CognitiveServices/accounts/`     |
| `Microsoft.Consumption/budgets`            | `src/resources/Microsoft.Consumption/budgets/`            |
| `Microsoft.EventGrid/eventSubscriptions`   | `src/resources/Microsoft.EventGrid/eventSubscriptions/`   |
| `Microsoft.EventGrid/topics`               | `src/resources/Microsoft.EventGrid/topics/`               |
| `Microsoft.Insights/actionGroups`          | `src/resources/Microsoft.Insights/actionGroups/`          |
| `Microsoft.Insights/components`            | `src/resources/Microsoft.Insights/components/`            |
| `Microsoft.Logic/workflows`                | `src/resources/Microsoft.Logic/workflows/`                |
| `Microsoft.OperationalInsights/workspaces` | `src/resources/Microsoft.OperationalInsights/workspaces/` |
| `Microsoft.Resources/resourceGroups`       | `src/resources/Microsoft.Resources/resourceGroups/`       |
| `Microsoft.Search/searchServices`          | `src/resources/Microsoft.Search/searchServices/`          |
| `Microsoft.SignalRService/webPubSub`       | `src/resources/Microsoft.SignalRService/webPubSub/`       |
| `Microsoft.Storage/storageAccounts`        | `src/resources/Microsoft.Storage/storageAccounts/`        |
| `Microsoft.Web/connections`                | `src/resources/Microsoft.Web/connections/`                |
| `Microsoft.Web/sites`                      | `src/resources/Microsoft.Web/sites/`                      |

## Protection

Imported resources keep `protect: true`. Remove protection only as part of an explicit lifecycle change after a clean preview confirms Pulumi state and Azure reality match.

## Migration Archive

The spreadsheet CSVs, generated import manifests, and import generator script have been removed from `packages/infra`.

The phase-1 migration record is archived at `features/completed/azure-pulumi-migration.md`.
