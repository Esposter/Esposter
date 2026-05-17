# Azure Naming Conventions

This document preserves the current Esposter Azure naming rules that were previously tracked in the asset spreadsheet.

The current names are intentionally documented before phase-2 optimization. Phase 2 may simplify, rename, or replace some tokens after the imported resources are safely represented in Pulumi.

## Resource Name Shape

Most Azure resources use this shape:

```text
<environment>-<scope>-<assetType>-<workload>-<region>-<index>
```

For storage accounts and search services, Azure naming rules do not allow hyphens, so the compact shape is used:

```text
<environment><scope><assetType><workload><region><index>
```

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

| Token | Environment |
| ----- | ----------- |
| `d`   | Development |
| `p`   | Production  |
| `t`   | Test        |

Only `d` and `p` are currently represented by imported Pulumi resources.

## Scope Tokens

| Token | Scope                 |
| ----- | --------------------- |
| `esp` | Esposter company-wide |
| `shp` | Shared platform       |
| `tnt` | Tenant-focused        |

Current imported resources use `shp`.

## Region Tokens

Current imported resources use Australia East:

| Token  | Azure Location  | Display Name   |
| ------ | --------------- | -------------- |
| `auea` | `australiaeast` | Australia East |

Other historical spreadsheet region tokens:

| Token    | Azure Location       | Display Name         |
| -------- | -------------------- | -------------------- |
| `aecn`   | `uaecentral`         | UAE Central          |
| `aeno`   | `uaenorth`           | UAE North            |
| `asea`   | `eastasia`           | East Asia            |
| `assoea` | `southeastasia`      | Southeast Asia       |
| `aucn`   | `australiacentral`   | Australia Central    |
| `aucn3`  | `australiacentral2`  | Australia Central 2  |
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

## Current Asset Type Tokens

These tokens are used by the currently imported Esposter resources.

| Token    | Asset Type                    | Azure ARM Type                             |
| -------- | ----------------------------- | ------------------------------------------ |
| `ag`     | Azure Monitor action group    | `Microsoft.Insights/actionGroups`          |
| `apicn`  | API connection                | `Microsoft.Web/connections`                |
| `appi`   | Application Insights          | `Microsoft.Insights/components`            |
| `bdg`    | Budget                        | `Microsoft.Consumption/budgets`            |
| `evgt`   | Event Grid Topic              | `Microsoft.EventGrid/topics`               |
| `evgts`  | Event Grid Topic Subscription | `Microsoft.EventGrid/eventSubscriptions`   |
| `func`   | Function app                  | `Microsoft.Web/sites`                      |
| `log`    | Log Analytics workspace       | `Microsoft.OperationalInsights/workspaces` |
| `logic`  | Logic apps                    | `Microsoft.Logic/workflows`                |
| `pubsub` | Web PubSub                    | `Microsoft.SignalRService/webPubSub`       |
| `rg`     | Resource group                | `Microsoft.Resources/resourceGroups`       |
| `spch`   | Cognitive Speech Services     | `Microsoft.CognitiveServices/accounts`     |
| `srch`   | Azure Cognitive Search        | `Microsoft.Search/searchServices`          |
| `st`     | Storage account               | `Microsoft.Storage/storageAccounts`        |

Historical spreadsheet rows also included `a` for Azure Monitor actions. Those rows did not import as standalone Azure resources; the behavior is represented through action group receivers.

## Historical Asset Type Catalogue

These tokens came from the spreadsheet reference tab and are preserved for later review.

| Token      | Asset Type                           |
| ---------- | ------------------------------------ |
| `aa`       | Automation account                   |
| `acr`      | Azure Container Registry             |
| `adf`      | Azure Data Factory                   |
| `agw`      | Application gateway                  |
| `aks`      | AKS cluster                          |
| `apim`     | API management service instance      |
| `app`      | Web app                              |
| `appcs`    | App Configuration store              |
| `arck`     | Azure Arc enabled Kubernetes cluster |
| `arcs`     | Azure Arc enabled server             |
| `asg`      | Application security group           |
| `asa`      | Azure Stream Analytics               |
| `as`       | Azure Analysis Services server       |
| `avail`    | Availability set                     |
| `bp`       | Blueprint                            |
| `bpa`      | Blueprint assignment                 |
| `ci`       | Container instance                   |
| `cld`      | Cloud service                        |
| `cmstb`    | Azure Cosmos DB database for table   |
| `cn`       | VPN connection                       |
| `cog`      | Azure Cognitive Services             |
| `cr`       | Container registry                   |
| `dbw`      | Azure Databricks workspace           |
| `dec`      | Azure Data Explorer cluster          |
| `disk`     | Managed disk data                    |
| `dla`      | Data Lake Analytics account          |
| `dls`      | Data Lake Store account              |
| `dms`      | Database Migration Service instance  |
| `erc`      | ExpressRoute circuit                 |
| `fd`       | Front door                           |
| `hadoop`   | HDInsight Hadoop cluster             |
| `hbase`    | HDInsight HBase cluster              |
| `ia`       | Integration account                  |
| `id`       | Managed Identity                     |
| `iot`      | IoT hub                              |
| `kafka`    | HDInsight Kafka cluster              |
| `kv`       | Key vault                            |
| `lbe`      | Load balancer external               |
| `lbi`      | Load balancer internal               |
| `lgw`      | Local network gateway                |
| `mg`       | Management group                     |
| `migr`     | Azure Migrate project                |
| `mls`      | HDInsight ML Services cluster        |
| `mlw`      | Azure Machine Learning workspace     |
| `mysql`    | MySQL database                       |
| `nic`      | Network interface                    |
| `nsg`      | Network security group               |
| `ntf`      | Notification Hubs                    |
| `ntfns`    | Notification Hubs namespace          |
| `osdisk`   | Managed disk OS                      |
| `pbi`      | Power BI Embedded                    |
| `peer`     | Virtual network peering              |
| `pep`      | Private Endpoint                     |
| `pip`      | Public IP address                    |
| `plan`     | App Service plan                     |
| `pl`       | Private Link                         |
| `policy`   | Policy definition                    |
| `psql`     | PostgreSQL database                  |
| `redis`    | Azure Cache for Redis instance       |
| `route`    | Route table                          |
| `rsv`      | Recovery Services vault              |
| `sb`       | Service Bus                          |
| `sbq`      | Service Bus queue                    |
| `sbt`      | Service Bus topic                    |
| `sf`       | Service Fabric cluster               |
| `snet`     | Subnet                               |
| `spark`    | HDInsight Spark cluster              |
| `sqldb`    | Azure SQL database                   |
| `sqldw`    | Azure SQL Data Warehouse             |
| `sqledp`   | SQL Elastic database pool            |
| `sqlmi`    | SQL Managed Instance                 |
| `sqlstrdb` | SQL Server Stretch Database          |
| `sql`      | Azure SQL Database server            |
| `ssimp`    | Azure StorSimple                     |
| `stc`      | Storage account classic              |
| `storm`    | HDInsight Storm cluster              |
| `stvm`     | VM storage account                   |
| `syn`      | Azure Synapse Analytics              |
| `traf`     | Traffic Manager profile              |
| `tsi`      | Time Series Insights environment     |
| `udr`      | User defined route                   |
| `vgw`      | Virtual network gateway              |
| `vm`       | Virtual machine                      |
| `vmss`     | Virtual machine scale set            |
| `vnet`     | Virtual network                      |
| `waf`      | Web Application Firewall policy      |

## Source File Names

Pulumi source files use camelCase derived from the Azure resource name:

| Azure Resource Name            | Source File                  |
| ------------------------------ | ---------------------------- |
| `d-shp-rg-esposter-auea-001`   | `dShpRgEsposterAuea001.ts`   |
| `dshpstespauea001`             | `dshpstespauea001.ts`        |
| `p-shp-func-esposter-auea-001` | `pShpFuncEsposterAuea001.ts` |

Resource folders mirror Azure ARM provider paths:

```text
src/resources/<ProviderNamespace>/<resourceTypes>/<resourceName>.ts
```
