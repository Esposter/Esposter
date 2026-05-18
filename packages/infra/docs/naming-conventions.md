# Azure Naming Conventions

This document defines the target Esposter Azure naming rules.

The existing imported resources mostly use the legacy spreadsheet shape. Renaming those resources requires explicit replacement or migration work, so existing names can remain until a resource is deliberately replaced. New resources and intentional renames should use the target convention below.

## Resource Name Shape

Most Azure resources should use this shape:

```text
<environment>-<assetType>-<workload>-<region>-<index>
```

For globally named resources that do not allow hyphens, use the compact shape:

```text
<environment><assetType><workload><index>
```

For globally named resources that allow hyphens, omit the region unless a second instance in another Azure region is planned:

```text
<environment>-<assetType>-<workload>-<index>
```

The target shape is intentionally ordered by scanning priority: environment first, resource type second, workload third, then region and index. It does not include the legacy `shp` scope token; ownership and platform scope are better represented by resource groups and tags.

Current workload:

| Token      | Meaning                       |
| ---------- | ----------------------------- |
| `esposter` | Esposter application workload |

Current index format:

| Spreadsheet Format | Azure Name Format |
| ------------------ | ----------------- |
| `#001`             | `001`             |
| `#002`             | `002`             |
| `#003`             | `003`             |
| `#004`             | `004`             |

## Environment Tokens

Target names use readable environment tokens:

| Token  | Environment |
| ------ | ----------- |
| `dev`  | Development |
| `prod` | Production  |
| `test` | Test        |

Legacy imported names use `d` and `p`. Do not use single-letter environment tokens for new names.

## Scope Tokens

Do not include scope tokens in target resource names. The legacy `shp` token meant "shared platform", but every imported resource uses it, so it does not distinguish resources in practice. Use resource group placement and tags for scope, ownership, and lifecycle metadata.

## Region Tokens

Use compact region tokens consistently. Current resources are in Australia East:

| Token  | Azure Location  | Display Name   |
| ------ | --------------- | -------------- |
| `auea` | `australiaeast` | Australia East |

Other approved region tokens:

| Token    | Azure Location       | Display Name         |
| -------- | -------------------- | -------------------- |
| `aecn`   | `uaecentral`         | UAE Central          |
| `aeno`   | `uaenorth`           | UAE North            |
| `asea`   | `eastasia`           | East Asia            |
| `assoea` | `southeastasia`      | Southeast Asia       |
| `aucn`   | `australiacentral`   | Australia Central    |
| `aucn2`  | `australiacentral2`  | Australia Central 2  |
| `ause`   | `australiasoutheast` | Australia Southeast  |
| `brso`   | `brazilsouth`        | Brazil South         |
| `cacn`   | `canadacentral`      | Canada Central       |
| `caea`   | `canadaeast`         | Canada East          |
| `chno`   | `switzerlandnorth`   | Switzerland North    |
| `chwe`   | `switzerlandwest`    | Switzerland West     |
| `deno`   | `germanynorth`       | Germany North        |
| `dewecn` | `germanywestcentral` | Germany West Central |
| `euno`   | `northeurope`        | North Europe         |
| `euwe`   | `westeurope`         | West Europe          |
| `frcn`   | `francecentral`      | France Central       |
| `frso`   | `francesouth`        | France South         |
| `incn`   | `centralindia`       | Central India        |
| `inso`   | `southindia`         | South India          |
| `inwe`   | `westindia`          | West India           |
| `jaea`   | `japaneast`          | Japan East           |
| `jawe`   | `japanwest`          | Japan West           |
| `krcn`   | `koreacentral`       | Korea Central        |
| `krso`   | `koreasouth`         | Korea South          |
| `noea`   | `norwayeast`         | Norway East          |
| `nowe`   | `norwaywest`         | Norway West          |
| `sfno`   | `southafricanorth`   | South Africa North   |
| `sfwe`   | `southafricawest`    | South Africa West    |
| `ukso`   | `uksouth`            | UK South             |
| `ukwe`   | `ukwest`             | UK West              |
| `uscn`   | `centralus`          | Central US           |
| `usea`   | `eastus`             | East US              |
| `usea2`  | `eastus2`            | East US 2            |
| `usnocn` | `northcentralus`     | North Central US     |
| `ussocn` | `southcentralus`     | South Central US     |
| `uswe`   | `westus`             | West US              |
| `uswe2`  | `westus2`            | West US 2            |
| `uswecn` | `westcentralus`      | West Central US      |

## Asset Type Tokens

Use Microsoft Cloud Adoption Framework abbreviations when one exists. Esposter-specific tokens are allowed only where CAF does not define a resource-type abbreviation.

These tokens are official for Esposter infrastructure. If a new Azure resource type is introduced and no token exists here, add the token in the same change as the resource. Unused tokens do not require migration.

| Token   | Asset Type                 | Azure ARM Type                              | Source         |
| ------- | -------------------------- | ------------------------------------------- | -------------- |
| `ag`    | Azure Monitor action group | `Microsoft.Insights/actionGroups`           | CAF            |
| `apicn` | API connection             | `Microsoft.Web/connections`                 | Esposter       |
| `appi`  | Application Insights       | `Microsoft.Insights/components`             | CAF            |
| `bdg`   | Budget                     | `Microsoft.Consumption/budgets`             | Esposter       |
| `evgs`  | Event Grid subscription    | `Microsoft.EventGrid/eventSubscriptions`    | CAF            |
| `evgt`  | Event Grid topic           | `Microsoft.EventGrid/topics`                | CAF-compatible |
| `func`  | Function app               | `Microsoft.Web/sites`                       | CAF            |
| `log`   | Log Analytics workspace    | `Microsoft.OperationalInsights/workspaces`  | CAF            |
| `logic` | Logic app                  | `Microsoft.Logic/workflows`                 | CAF            |
| `pa`    | Policy assignment          | `Microsoft.Authorization/policyAssignments` | Esposter       |
| `rg`    | Resource group             | `Microsoft.Resources/resourceGroups`        | CAF            |
| `spch`  | Speech service             | `Microsoft.CognitiveServices/accounts`      | CAF            |
| `srch`  | Azure AI Search            | `Microsoft.Search/searchServices`           | CAF            |
| `st`    | Storage account            | `Microsoft.Storage/storageAccounts`         | CAF            |
| `wps`   | Web PubSub                 | `Microsoft.SignalRService/webPubSub`        | CAF            |

Do not use `a` for Azure Monitor actions. Action behavior belongs inside the owning action group resource.

Legacy imported resources use `evgts` for Event Grid subscriptions and `pubsub` for Web PubSub. Target names use `evgs` and `wps`.

## Reserved Asset Type Tokens

These tokens are approved for future resource types. They include the unused spreadsheet tokens plus useful CAF-aligned additions. They are not migration work unless a live resource currently uses a different token.

| Token      | Asset Type                           | Azure ARM Type / Notes                                               |
| ---------- | ------------------------------------ | -------------------------------------------------------------------- |
| `aa`       | Automation account                   | `Microsoft.Automation/automationAccounts`                            |
| `a`        | Azure Monitor action                 | Action group receiver, not a standalone Azure resource               |
| `acr`      | Azure Container Registry             | `Microsoft.ContainerRegistry/registries`                             |
| `adf`      | Azure Data Factory                   | `Microsoft.DataFactory/factories`                                    |
| `agw`      | Application gateway                  | `Microsoft.Network/applicationGateways`                              |
| `ais`      | Azure AI services                    | `Microsoft.CognitiveServices/accounts`                               |
| `aks`      | AKS cluster                          | `Microsoft.ContainerService/managedClusters`                         |
| `apim`     | API Management service               | `Microsoft.ApiManagement/service`                                    |
| `app`      | Web app                              | `Microsoft.Web/sites`                                                |
| `appcs`    | App Configuration store              | `Microsoft.AppConfiguration/configurationStores`                     |
| `arck`     | Azure Arc enabled Kubernetes cluster | `Microsoft.Kubernetes/connectedClusters`                             |
| `arcs`     | Azure Arc enabled server             | `Microsoft.HybridCompute/machines`                                   |
| `asa`      | Azure Stream Analytics job           | `Microsoft.StreamAnalytics/streamingJobs`                            |
| `as`       | Azure Analysis Services server       | `Microsoft.AnalysisServices/servers`                                 |
| `asg`      | Application security group           | `Microsoft.Network/applicationSecurityGroups`                        |
| `asp`      | App Service plan                     | `Microsoft.Web/serverFarms`                                          |
| `avail`    | Availability set                     | `Microsoft.Compute/availabilitySets`                                 |
| `bp`       | Blueprint                            | `Microsoft.Blueprint/blueprints`                                     |
| `bpa`      | Blueprint assignment                 | `Microsoft.Blueprint/blueprintAssignments`                           |
| `ca`       | Container app                        | `Microsoft.App/containerApps`                                        |
| `cae`      | Container Apps environment           | `Microsoft.App/managedEnvironments`                                  |
| `ci`       | Container instance                   | `Microsoft.ContainerInstance/containerGroups`                        |
| `cld`      | Cloud service                        | `Microsoft.Compute/cloudServices`                                    |
| `cmstb`    | Azure Cosmos DB database for table   | `Microsoft.DocumentDB/databaseAccounts`                              |
| `cn`       | VPN connection                       | `Microsoft.Network/connections`                                      |
| `cog`      | Azure Cognitive Services             | `Microsoft.CognitiveServices/accounts`                               |
| `cr`       | Container registry                   | `Microsoft.ContainerRegistry/registries`                             |
| `dbw`      | Azure Databricks workspace           | `Microsoft.Databricks/workspaces`                                    |
| `dec`      | Azure Data Explorer cluster          | `Microsoft.Kusto/clusters`                                           |
| `disk`     | Managed disk data                    | `Microsoft.Compute/disks`                                            |
| `dla`      | Data Lake Analytics account          | `Microsoft.DataLakeAnalytics/accounts`                               |
| `dls`      | Data Lake Store account              | `Microsoft.DataLakeStore/accounts`                                   |
| `dms`      | Database Migration Service instance  | `Microsoft.DataMigration/services`                                   |
| `erc`      | ExpressRoute circuit                 | `Microsoft.Network/expressRouteCircuits`                             |
| `fd`       | Front Door                           | `Microsoft.Network/frontDoors`                                       |
| `hadoop`   | HDInsight Hadoop cluster             | `Microsoft.HDInsight/clusters`                                       |
| `hbase`    | HDInsight HBase cluster              | `Microsoft.HDInsight/clusters`                                       |
| `ia`       | Integration account                  | `Microsoft.Logic/integrationAccounts`                                |
| `id`       | Managed identity                     | `Microsoft.ManagedIdentity/userAssignedIdentities`                   |
| `iot`      | IoT Hub                              | `Microsoft.Devices/IotHubs`                                          |
| `kafka`    | HDInsight Kafka cluster              | `Microsoft.HDInsight/clusters`                                       |
| `kv`       | Key vault                            | `Microsoft.KeyVault/vaults`                                          |
| `lbe`      | Load balancer external               | `Microsoft.Network/loadBalancers`                                    |
| `lbi`      | Load balancer internal               | `Microsoft.Network/loadBalancers`                                    |
| `lgw`      | Local network gateway                | `Microsoft.Network/localNetworkGateways`                             |
| `mg`       | Management group                     | `Microsoft.Management/managementGroups`                              |
| `migr`     | Azure Migrate project                | `Microsoft.Migrate/migrateProjects`                                  |
| `mls`      | HDInsight ML Services cluster        | `Microsoft.HDInsight/clusters`                                       |
| `mlw`      | Azure Machine Learning workspace     | `Microsoft.MachineLearningServices/workspaces`                       |
| `mysql`    | MySQL database                       | `Microsoft.DBforMySQL/flexibleServers`                               |
| `nic`      | Network interface                    | `Microsoft.Network/networkInterfaces`                                |
| `nsg`      | Network security group               | `Microsoft.Network/networkSecurityGroups`                            |
| `ntf`      | Notification Hubs                    | `Microsoft.NotificationHubs/namespaces/notificationHubs`             |
| `ntfns`    | Notification Hubs namespace          | `Microsoft.NotificationHubs/namespaces`                              |
| `oai`      | Azure OpenAI Service                 | `Microsoft.CognitiveServices/accounts`                               |
| `osdisk`   | Managed disk OS                      | `Microsoft.Compute/disks`                                            |
| `pbi`      | Power BI Embedded                    | `Microsoft.PowerBIDedicated/capacities`                              |
| `peer`     | Virtual network peering              | `Microsoft.Network/virtualNetworks/virtualNetworkPeerings`           |
| `pep`      | Private endpoint                     | `Microsoft.Network/privateEndpoints`                                 |
| `pip`      | Public IP address                    | `Microsoft.Network/publicIPAddresses`                                |
| `plan`     | App Service plan                     | `Microsoft.Web/serverFarms`                                          |
| `pl`       | Private Link                         | Private Link resources                                               |
| `policy`   | Policy definition                    | `Microsoft.Authorization/policyDefinitions`                          |
| `psql`     | PostgreSQL database                  | `Microsoft.DBforPostgreSQL/flexibleServers`                          |
| `redis`    | Azure Cache for Redis instance       | `Microsoft.Cache/redis`                                              |
| `route`    | Route table                          | `Microsoft.Network/routeTables`                                      |
| `rsv`      | Recovery Services vault              | `Microsoft.RecoveryServices/vaults`                                  |
| `sb`       | Service Bus                          | `Microsoft.ServiceBus/namespaces`                                    |
| `sbns`     | Service Bus namespace                | `Microsoft.ServiceBus/namespaces`                                    |
| `sbq`      | Service Bus queue                    | `Microsoft.ServiceBus/namespaces/queues`                             |
| `sbt`      | Service Bus topic                    | `Microsoft.ServiceBus/namespaces/topics`                             |
| `sbts`     | Service Bus topic subscription       | `Microsoft.ServiceBus/namespaces/topics/subscriptions`               |
| `sf`       | Service Fabric cluster               | `Microsoft.ServiceFabric/clusters`                                   |
| `snet`     | Subnet                               | `Microsoft.Network/virtualNetworks/subnets`                          |
| `spark`    | HDInsight Spark cluster              | `Microsoft.HDInsight/clusters`                                       |
| `sql`      | Azure SQL Database server            | `Microsoft.Sql/servers`                                              |
| `sqldb`    | Azure SQL database                   | `Microsoft.Sql/servers/databases`                                    |
| `sqldw`    | Azure SQL Data Warehouse             | `Microsoft.Sql/servers/databases`                                    |
| `sqledp`   | SQL Elastic database pool            | `Microsoft.Sql/servers/elasticPools`                                 |
| `sqlmi`    | SQL Managed Instance                 | `Microsoft.Sql/managedInstances`                                     |
| `sqlstrdb` | SQL Server Stretch Database          | `Microsoft.Sql/servers/databases`                                    |
| `ssimp`    | Azure StorSimple                     | `Microsoft.StorSimple/managers`                                      |
| `stc`      | Storage account classic              | `Microsoft.ClassicStorage/storageAccounts`                           |
| `storm`    | HDInsight Storm cluster              | `Microsoft.HDInsight/clusters`                                       |
| `stvm`     | VM storage account                   | `Microsoft.Storage/storageAccounts`                                  |
| `syn`      | Azure Synapse Analytics              | `Microsoft.Synapse/workspaces`                                       |
| `traf`     | Traffic Manager profile              | `Microsoft.Network/trafficManagerProfiles`                           |
| `tsi`      | Time Series Insights environment     | `Microsoft.TimeSeriesInsights/environments`                          |
| `udr`      | User defined route                   | `Microsoft.Network/routeTables/routes`                               |
| `vgw`      | Virtual network gateway              | `Microsoft.Network/virtualNetworkGateways`                           |
| `vm`       | Virtual machine                      | `Microsoft.Compute/virtualMachines`                                  |
| `vmss`     | Virtual machine scale set            | `Microsoft.Compute/virtualMachineScaleSets`                          |
| `vnet`     | Virtual network                      | `Microsoft.Network/virtualNetworks`                                  |
| `waf`      | Web Application Firewall policy      | `Microsoft.Network/ApplicationGatewayWebApplicationFirewallPolicies` |

## Examples

| Resource Type           | Legacy Name                      | Target Name                   |
| ----------------------- | -------------------------------- | ----------------------------- |
| Resource group          | `p-shp-rg-esposter-auea-001`     | `prod-rg-esposter-auea-001`   |
| Function app            | `p-shp-func-esposter-auea-001`   | `prod-func-esposter-001`      |
| Storage account         | `pshpstespauea001`               | `prodstesposter001`           |
| Azure AI Search         | `pshpsrchespauea001`             | `prod-srch-esposter-001`      |
| Event Grid subscription | `p-shp-evgts-esposter-auea-001`  | `prod-evgs-esposter-auea-001` |
| Web PubSub              | `p-shp-pubsub-esposter-auea-001` | `prod-wps-esposter-001`       |

## Source File Names

One resource declaration per file. Pulumi source files use lower camel case derived from the naming components, not a character-for-character copy of the Azure resource name. This keeps compact Azure names readable in TypeScript.

The export constant name must match the file name minus `.ts`.

Target examples:

| Azure Resource Name         | Naming Components                       | Source File                | Export Constant         |
| --------------------------- | --------------------------------------- | -------------------------- | ----------------------- |
| `prod-rg-esposter-auea-001` | `prod`, `rg`, `esposter`, `Auea`, `001` | `prodRgEsposterAuea001.ts` | `prodRgEsposterAuea001` |
| `prod-func-esposter-001`    | `prod`, `func`, `esposter`, `001`       | `prodFuncEsposter001.ts`   | `prodFuncEsposter001`   |
| `prodstesposter001`         | `prod`, `st`, `esposter`, `001`         | `prodStEsposter001.ts`     | `prodStEsposter001`     |
| `prod-srch-esposter-001`    | `prod`, `srch`, `esposter`, `001`       | `prodSrchEsposter001.ts`   | `prodSrchEsposter001`   |

Legacy examples:

| Azure Resource Name            | Source File                  | Export Constant           |
| ------------------------------ | ---------------------------- | ------------------------- |
| `d-shp-rg-esposter-auea-001`   | `dShpRgEsposterAuea001.ts`   | `dShpRgEsposterAuea001`   |
| `dshpstespauea001`             | `dshpstespauea001.ts`        | `dshpstespauea001`        |
| `p-shp-func-esposter-auea-001` | `pShpFuncEsposterAuea001.ts` | `pShpFuncEsposterAuea001` |

Resource folders mirror Azure ARM provider paths:

```text
src/resources/<ProviderNamespace>/<resourceTypes>/<resourceName>.ts
```

## Child Resource File Names

Child resources append the Pulumi resource type name as a suffix. When the Azure child name is a mandatory singleton (such as `default`), it is omitted from the file and export name because it carries no information:

| Azure Child Resource                          | Pulumi Type             | Source File                           | Export Constant                    |
| --------------------------------------------- | ----------------------- | ------------------------------------- | ---------------------------------- |
| `dshpstespauea001/blobServices/default`       | `BlobServiceProperties` | `dshpstespauea001Properties.ts`       | `dshpstespauea001Properties`       |
| `dshpstespauea001/managementPolicies/default` | `ManagementPolicy`      | `dshpstespauea001ManagementPolicy.ts` | `dshpstespauea001ManagementPolicy` |

The suffix is the full Pulumi resource type name (`BlobServiceProperties`, `ManagementPolicy`, etc.), not abbreviated.
