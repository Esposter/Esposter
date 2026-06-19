# Infrastructure Overview

Pulumi currently has 92 tracked source files under `src/azure/resources/`. Both development and production resources are declared in one unified stack.

`pulumi stack` reports 94 total resources: 92 source-file resources plus two Pulumi meta-resources that require no TypeScript declarations — `pulumi:pulumi:Stack` (the stack record itself) and `pulumi:providers:azure-native` (the provider instance). Both are auto-managed by Pulumi.

## Summary By Environment

| Environment           | Scope                                               | Resource Count |
| --------------------- | --------------------------------------------------- | -------------: |
| Development           | `dev-*` Azure resources and their role assignments  |             45 |
| Production            | `prod-*` Azure resources and their role assignments |             45 |
| Shared / Subscription | owner, policy                                       |              2 |

## Summary By Asset Type

| Asset Type                     | Count |
| ------------------------------ | ----: |
| API connection                 |     8 |
| App Service plan               |     2 |
| Application Insights           |     2 |
| Azure AI Search                |     2 |
| Azure Monitor action group     |     6 |
| Budget                         |     4 |
| Event Grid topic               |     2 |
| Event Grid topic subscription  |     4 |
| Function app                   |     2 |
| Log Analytics workspace        |     2 |
| Logic app                      |     8 |
| Logic Apps Management solution |     2 |
| Policy assignment              |     1 |
| Resource group                 |     2 |
| Role assignment                |    25 |
| Smart Detector Alert Rule      |    12 |
| Storage account                |     2 |
| Storage blob service           |     2 |
| Storage lifecycle policy       |     2 |
| Web PubSub                     |     2 |

## Source Tree

Resource files are grouped by Azure ARM provider namespace and resource type:

| Azure ARM Type                                         | Source Folder                                                               |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `Microsoft.AlertsManagement/smartDetectorAlertRules`   | `src/azure/resources/Microsoft.AlertsManagement/smartDetectorAlertRules/`   |
| `Microsoft.Authorization/policyAssignments`            | `src/azure/resources/Microsoft.Authorization/policyAssignments/`            |
| `Microsoft.Authorization/roleAssignments`              | `src/azure/resources/Microsoft.Authorization/roleAssignments/`              |
| `Microsoft.Consumption/budgets`                        | `src/azure/resources/Microsoft.Consumption/budgets/`                        |
| `Microsoft.EventGrid/eventSubscriptions`               | `src/azure/resources/Microsoft.EventGrid/eventSubscriptions/`               |
| `Microsoft.EventGrid/topics`                           | `src/azure/resources/Microsoft.EventGrid/topics/`                           |
| `Microsoft.Insights/actionGroups`                      | `src/azure/resources/Microsoft.Insights/actionGroups/`                      |
| `Microsoft.Insights/components`                        | `src/azure/resources/Microsoft.Insights/components/`                        |
| `Microsoft.Logic/workflows`                            | `src/azure/resources/Microsoft.Logic/workflows/`                            |
| `Microsoft.OperationalInsights/workspaces`             | `src/azure/resources/Microsoft.OperationalInsights/workspaces/`             |
| `Microsoft.OperationsManagement/solutions`             | `src/azure/resources/Microsoft.OperationsManagement/solutions/`             |
| `Microsoft.Resources/resourceGroups`                   | `src/azure/resources/Microsoft.Resources/resourceGroups/`                   |
| `Microsoft.Search/searchServices`                      | `src/azure/resources/Microsoft.Search/searchServices/`                      |
| `Microsoft.SignalRService/webPubSub`                   | `src/azure/resources/Microsoft.SignalRService/webPubSub/`                   |
| `Microsoft.Storage/storageAccounts`                    | `src/azure/resources/Microsoft.Storage/storageAccounts/`                    |
| `Microsoft.Storage/storageAccounts/blobServices`       | `src/azure/resources/Microsoft.Storage/storageAccounts/blobServices/`       |
| `Microsoft.Storage/storageAccounts/managementPolicies` | `src/azure/resources/Microsoft.Storage/storageAccounts/managementPolicies/` |
| `Microsoft.Web/connections`                            | `src/azure/resources/Microsoft.Web/connections/`                            |
| `Microsoft.Web/serverFarms`                            | `src/azure/resources/Microsoft.Web/serverFarms/`                            |
| `Microsoft.Web/sites`                                  | `src/azure/resources/Microsoft.Web/sites/`                                  |

## Protection

Imported resources keep `protect: true`. Remove protection only as part of an explicit lifecycle change after a clean preview confirms Pulumi state and Azure reality match.
