# Infrastructure Overview

Pulumi currently has 78 tracked source files under `src/resources/`. Both development and production resources are declared in one unified stack.

## Summary By Environment

| Environment  | Prefix | Resource Count |
| ------------ | ------ | -------------: |
| Development  | `d`    |             41 |
| Production   | `p`    |             36 |
| Subscription | none   |              1 |

## Summary By Asset Type

| Asset Type                      | Count |
| ------------------------------- | ----: |
| API connection                  |     8 |
| Application Insights            |     2 |
| Azure Cognitive Search          |     2 |
| Azure Cognitive Speech Services |     1 |
| Azure Monitor action group      |     6 |
| Budget                          |     4 |
| Event Grid Topic                |     2 |
| Event Grid Topic Subscription   |     4 |
| Function app                    |     2 |
| Log Analytics workspace         |     2 |
| Logic apps                      |     8 |
| Policy assignment               |     1 |
| Role assignment                 |    26 |
| Resource group                  |     2 |
| Storage account                 |     2 |
| Storage blob service            |     2 |
| Storage lifecycle policy        |     2 |
| Web PubSub                      |     2 |

## Source Tree

Resource files are grouped by Azure ARM provider namespace and resource type:

| Azure ARM Type                                         | Source Folder                                                         |
| ------------------------------------------------------ | --------------------------------------------------------------------- |
| `Microsoft.Authorization/policyAssignments`            | `src/resources/Microsoft.Authorization/policyAssignments/`            |
| `Microsoft.Authorization/roleAssignments`              | `src/resources/Microsoft.Authorization/roleAssignments/`              |
| `Microsoft.CognitiveServices/accounts`                 | `src/resources/Microsoft.CognitiveServices/accounts/`                 |
| `Microsoft.Consumption/budgets`                        | `src/resources/Microsoft.Consumption/budgets/`                        |
| `Microsoft.EventGrid/eventSubscriptions`               | `src/resources/Microsoft.EventGrid/eventSubscriptions/`               |
| `Microsoft.EventGrid/topics`                           | `src/resources/Microsoft.EventGrid/topics/`                           |
| `Microsoft.Insights/actionGroups`                      | `src/resources/Microsoft.Insights/actionGroups/`                      |
| `Microsoft.Insights/components`                        | `src/resources/Microsoft.Insights/components/`                        |
| `Microsoft.Logic/workflows`                            | `src/resources/Microsoft.Logic/workflows/`                            |
| `Microsoft.OperationalInsights/workspaces`             | `src/resources/Microsoft.OperationalInsights/workspaces/`             |
| `Microsoft.Resources/resourceGroups`                   | `src/resources/Microsoft.Resources/resourceGroups/`                   |
| `Microsoft.Search/searchServices`                      | `src/resources/Microsoft.Search/searchServices/`                      |
| `Microsoft.SignalRService/webPubSub`                   | `src/resources/Microsoft.SignalRService/webPubSub/`                   |
| `Microsoft.Storage/storageAccounts`                    | `src/resources/Microsoft.Storage/storageAccounts/`                    |
| `Microsoft.Storage/storageAccounts/blobServices`       | `src/resources/Microsoft.Storage/storageAccounts/blobServices/`       |
| `Microsoft.Storage/storageAccounts/managementPolicies` | `src/resources/Microsoft.Storage/storageAccounts/managementPolicies/` |
| `Microsoft.Web/connections`                            | `src/resources/Microsoft.Web/connections/`                            |
| `Microsoft.Web/sites`                                  | `src/resources/Microsoft.Web/sites/`                                  |

## Protection

Imported resources keep `protect: true`. Remove protection only as part of an explicit lifecycle change after a clean preview confirms Pulumi state and Azure reality match.
