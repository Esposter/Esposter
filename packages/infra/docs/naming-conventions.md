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

Use the official Azure geo codes (lowercase) as region tokens. Source: [Azure Backup geo-code list](https://learn.microsoft.com/en-us/azure/backup/scripts/geo-code-list). Current resources are in Australia East:

| Token | Azure Location  | Display Name   | Geo Code |
| ----- | --------------- | -------------- | -------- |
| `ae`  | `australiaeast` | Australia East | `AE`     |

Other approved region tokens:

| Token  | Azure Location       | Display Name         | Geo Code |
| ------ | -------------------- | -------------------- | -------- |
| `acl`  | `australiacentral`   | Australia Central    | `ACL`    |
| `acl2` | `australiacentral2`  | Australia Central 2  | `ACL2`   |
| `ase`  | `australiasoutheast` | Australia Southeast  | `ASE`    |
| `brs`  | `brazilsouth`        | Brazil South         | `BRS`    |
| `cnc`  | `canadacentral`      | Canada Central       | `CNC`    |
| `cne`  | `canadaeast`         | Canada East          | `CNE`    |
| `cus`  | `centralus`          | Central US           | `CUS`    |
| `ea`   | `eastasia`           | East Asia            | `EA`     |
| `eus`  | `eastus`             | East US              | `EUS`    |
| `eus2` | `eastus2`            | East US 2            | `EUS2`   |
| `frc`  | `francecentral`      | France Central       | `FRC`    |
| `frs`  | `francesouth`        | France South         | `FRS`    |
| `gn`   | `germanynorth`       | Germany North        | `GN`     |
| `gwc`  | `germanywestcentral` | Germany West Central | `GWC`    |
| `inc`  | `centralindia`       | Central India        | `INC`    |
| `ins`  | `southindia`         | South India          | `INS`    |
| `inw`  | `westindia`          | West India           | `INW`    |
| `jpe`  | `japaneast`          | Japan East           | `JPE`    |
| `jpw`  | `japanwest`          | Japan West           | `JPW`    |
| `krc`  | `koreacentral`       | Korea Central        | `KRC`    |
| `krs`  | `koreasouth`         | Korea South          | `KRS`    |
| `ncus` | `northcentralus`     | North Central US     | `NCUS`   |
| `ne`   | `northeurope`        | North Europe         | `NE`     |
| `nwe`  | `norwayeast`         | Norway East          | `NWE`    |
| `nww`  | `norwaywest`         | Norway West          | `NWW`    |
| `san`  | `southafricanorth`   | South Africa North   | `SAN`    |
| `saw`  | `southafricawest`    | South Africa West    | `SAW`    |
| `scus` | `southcentralus`     | South Central US     | `SCUS`   |
| `sea`  | `southeastasia`      | Southeast Asia       | `SEA`    |
| `szn`  | `switzerlandnorth`   | Switzerland North    | `SZN`    |
| `szw`  | `switzerlandwest`    | Switzerland West     | `SZW`    |
| `uac`  | `uaecentral`         | UAE Central          | `UAC`    |
| `uan`  | `uaenorth`           | UAE North            | `UAN`    |
| `uks`  | `uksouth`            | UK South             | `UKS`    |
| `ukw`  | `ukwest`             | UK West              | `UKW`    |
| `wcus` | `westcentralus`      | West Central US      | `WCUS`   |
| `we`   | `westeurope`         | West Europe          | `WE`     |
| `wus`  | `westus`             | West US              | `WUS`    |
| `wus2` | `westus2`            | West US 2            | `WUS2`   |

## Asset Type Tokens

Use Microsoft Cloud Adoption Framework abbreviations when one exists. Esposter-specific tokens are allowed only where CAF does not define a resource-type abbreviation.

These tokens are official for Esposter infrastructure. If a new Azure resource type is introduced and no token exists here, add the token in the same change as the resource. Unused tokens do not require migration.

| Token   | Asset Type                 | Azure ARM Type                              | Source   |
| ------- | -------------------------- | ------------------------------------------- | -------- |
| `ag`    | Azure Monitor action group | `Microsoft.Insights/actionGroups`           | CAF      |
| `apic`  | API connection             | `Microsoft.Web/connections`                 | Esposter |
| `appi`  | Application Insights       | `Microsoft.Insights/components`             | CAF      |
| `bgt`   | Budget                     | `Microsoft.Consumption/budgets`             | Esposter |
| `evgs`  | Event Grid subscription    | `Microsoft.EventGrid/eventSubscriptions`    | CAF      |
| `evgt`  | Event Grid topic           | `Microsoft.EventGrid/topics`                | CAF      |
| `func`  | Function app               | `Microsoft.Web/sites`                       | CAF      |
| `log`   | Log Analytics workspace    | `Microsoft.OperationalInsights/workspaces`  | CAF      |
| `logic` | Logic app                  | `Microsoft.Logic/workflows`                 | CAF      |
| `pa`    | Policy assignment          | `Microsoft.Authorization/policyAssignments` | Esposter |
| `rg`    | Resource group             | `Microsoft.Resources/resourceGroups`        | CAF      |
| `spch`  | Speech service             | `Microsoft.CognitiveServices/accounts`      | CAF      |
| `srch`  | Azure AI Search            | `Microsoft.Search/searchServices`           | CAF      |
| `st`    | Storage account            | `Microsoft.Storage/storageAccounts`         | CAF      |
| `wps`   | Web PubSub                 | `Microsoft.SignalRService/webPubSub`        | CAF      |

Do not use `a` for Azure Monitor actions. Action behavior belongs inside the owning action group resource.

Legacy imported resources use `evgts` for Event Grid subscriptions and `pubsub` for Web PubSub. Target names use `evgs` and `wps`.

Legacy resources created in v8 use `apicn` for API connections and `bdg` for budgets. Target names use `apic` and `bgt`.

## Reserved Asset Type Tokens

These tokens are the complete set of CAF abbreviations plus Esposter-specific additions, all approved for future use. Source column indicates whether the token comes from the [CAF abbreviations list](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations) or is Esposter-defined. They are not migration work unless a live resource currently uses a different token.

### AI and machine learning

| Token   | Asset Type                       | Azure ARM Type                                  | Source |
| ------- | -------------------------------- | ----------------------------------------------- | ------ |
| `aif`   | Foundry account                  | `Microsoft.CognitiveServices/accounts`          | CAF    |
| `ais`   | Foundry Tools (multi-service)    | `Microsoft.CognitiveServices/accounts`          | CAF    |
| `avi`   | Azure AI Video Indexer           | `Microsoft.VideoIndexer/accounts`               | CAF    |
| `bot`   | Bot service                      | `Microsoft.BotService/botServices`              | CAF    |
| `cm`    | Content moderator                | `Microsoft.CognitiveServices/accounts`          | CAF    |
| `cs`    | Content safety                   | `Microsoft.CognitiveServices/accounts`          | CAF    |
| `cstv`  | Custom vision (prediction)       | `Microsoft.CognitiveServices/accounts`          | CAF    |
| `cstvt` | Custom vision (training)         | `Microsoft.CognitiveServices/accounts`          | CAF    |
| `cv`    | Computer vision                  | `Microsoft.CognitiveServices/accounts`          | CAF    |
| `di`    | Document intelligence            | `Microsoft.CognitiveServices/accounts`          | CAF    |
| `face`  | Face API                         | `Microsoft.CognitiveServices/accounts`          | CAF    |
| `hi`    | Health Insights                  | `Microsoft.CognitiveServices/accounts`          | CAF    |
| `hub`   | Foundry hub                      | `Microsoft.MachineLearningServices/workspaces`  | CAF    |
| `ir`    | Immersive reader                 | `Microsoft.CognitiveServices/accounts`          | CAF    |
| `lang`  | Language service                 | `Microsoft.CognitiveServices/accounts`          | CAF    |
| `mlw`   | Azure Machine Learning workspace | `Microsoft.MachineLearningServices/workspaces`  | CAF    |
| `oai`   | Azure OpenAI Service             | `Microsoft.CognitiveServices/accounts`          | CAF    |
| `proj`  | Foundry project                  | `Microsoft.CognitiveServices/accounts/projects` | CAF    |
| `trsl`  | Translator                       | `Microsoft.CognitiveServices/accounts`          | CAF    |

### Analytics and IoT

| Token    | Asset Type                           | Azure ARM Type                                        | Source |
| -------- | ------------------------------------ | ----------------------------------------------------- | ------ |
| `adf`    | Azure Data Factory                   | `Microsoft.DataFactory/factories`                     | CAF    |
| `as`     | Azure Analysis Services server       | `Microsoft.AnalysisServices/servers`                  | CAF    |
| `asa`    | Azure Stream Analytics               | `Microsoft.StreamAnalytics/cluster`                   | CAF    |
| `dbac`   | Azure Databricks Access Connector    | `Microsoft.Databricks/workspaces/accessConnectors`    | CAF    |
| `dbw`    | Azure Databricks workspace           | `Microsoft.Databricks/workspaces`                     | CAF    |
| `dec`    | Azure Data Explorer cluster          | `Microsoft.Kusto/clusters`                            | CAF    |
| `dedb`   | Azure Data Explorer cluster database | `Microsoft.Kusto/clusters/databases`                  | CAF    |
| `dls`    | Data Lake Store account              | `Microsoft.DataLakeStore/accounts`                    | CAF    |
| `dt`     | Azure Digital Twin instance          | `Microsoft.DigitalTwins/digitalTwinsInstances`        | CAF    |
| `egst`   | Event Grid system topic              | `Microsoft.EventGrid/systemTopics`                    | CAF    |
| `evgd`   | Event Grid domain                    | `Microsoft.EventGrid/domains`                         | CAF    |
| `evgns`  | Event Grid namespace                 | `Microsoft.EventGrid/namespaces`                      | CAF    |
| `evh`    | Event hub                            | `Microsoft.EventHub/namespaces/eventHubs`             | CAF    |
| `evhns`  | Event Hubs namespace                 | `Microsoft.EventHub/namespaces`                       | CAF    |
| `fc`     | Fabric Capacity                      | `Microsoft.Fabric/capacities`                         | CAF    |
| `hadoop` | HDInsight Hadoop cluster             | `Microsoft.HDInsight/clusters`                        | CAF    |
| `hbase`  | HDInsight HBase cluster              | `Microsoft.HDInsight/clusters`                        | CAF    |
| `iot`    | IoT Hub                              | `Microsoft.Devices/IotHubs`                           | CAF    |
| `kafka`  | HDInsight Kafka cluster              | `Microsoft.HDInsight/clusters`                        | CAF    |
| `mls`    | HDInsight ML Services cluster        | `Microsoft.HDInsight/clusters`                        | CAF    |
| `pbi`    | Power BI Embedded                    | `Microsoft.PowerBIDedicated/capacities`               | CAF    |
| `pcert`  | Provisioning services certificate    | `Microsoft.Devices/provisioningServices/certificates` | CAF    |
| `provs`  | Provisioning services                | `Microsoft.Devices/provisioningServices`              | CAF    |
| `spark`  | HDInsight Spark cluster              | `Microsoft.HDInsight/clusters`                        | CAF    |
| `storm`  | HDInsight Storm cluster              | `Microsoft.HDInsight/clusters`                        | CAF    |
| `tsi`    | Time Series Insights environment     | `Microsoft.TimeSeriesInsights/environments`           | CAF    |

### Compute and web

| Token    | Asset Type                           | Azure ARM Type                                           | Source |
| -------- | ------------------------------------ | -------------------------------------------------------- | ------ |
| `acs`    | Communication Services               | `Microsoft.Communication/communicationServices`          | CAF    |
| `app`    | Web app                              | `Microsoft.Web/sites`                                    | CAF    |
| `arcgw`  | Azure Arc gateway                    | `Microsoft.HybridCompute/gateways`                       | CAF    |
| `arck`   | Azure Arc enabled Kubernetes cluster | `Microsoft.Kubernetes/connectedClusters`                 | CAF    |
| `arcs`   | Azure Arc enabled server             | `Microsoft.HybridCompute/machines`                       | CAF    |
| `ase`    | App Service environment              | `Microsoft.Web/hostingEnvironments`                      | CAF    |
| `asp`    | App Service plan                     | `Microsoft.Web/serverFarms`                              | CAF    |
| `avail`  | Availability set                     | `Microsoft.Compute/availabilitySets`                     | CAF    |
| `ba`     | Batch accounts                       | `Microsoft.Batch/batchAccounts`                          | CAF    |
| `cld`    | Cloud service                        | `Microsoft.Compute/cloudServices`                        | CAF    |
| `des`    | Disk encryption set                  | `Microsoft.Compute/diskEncryptionSets`                   | CAF    |
| `disk`   | Managed disk (data)                  | `Microsoft.Compute/disks`                                | CAF    |
| `gal`    | Gallery                              | `Microsoft.Compute/galleries`                            | CAF    |
| `it`     | Image template                       | `Microsoft.VirtualMachineImages/imageTemplates`          | CAF    |
| `lt`     | Azure Load Testing instance          | `Microsoft.LoadTestService/loadTests`                    | CAF    |
| `mc`     | VM maintenance configuration         | `Microsoft.Maintenance/maintenanceConfigurations`        | CAF    |
| `ntf`    | Notification Hubs                    | `Microsoft.NotificationHubs/namespaces/notificationHubs` | CAF    |
| `ntfns`  | Notification Hubs namespace          | `Microsoft.NotificationHubs/namespaces`                  | CAF    |
| `osdisk` | Managed disk (OS)                    | `Microsoft.Compute/disks`                                | CAF    |
| `ppg`    | Proximity placement group            | `Microsoft.Compute/proximityPlacementGroups`             | CAF    |
| `rpc`    | Restore point collection             | `Microsoft.Compute/restorePointCollections`              | CAF    |
| `snap`   | Snapshot                             | `Microsoft.Compute/snapshots`                            | CAF    |
| `stapp`  | Static web app                       | `Microsoft.Web/staticSites`                              | CAF    |
| `stvm`   | VM storage account                   | `Microsoft.Storage/storageAccounts`                      | CAF    |
| `vm`     | Virtual machine                      | `Microsoft.Compute/virtualMachines`                      | CAF    |
| `vmss`   | Virtual machine scale set            | `Microsoft.Compute/virtualMachineScaleSets`              | CAF    |

### Containers

| Token      | Asset Type                     | Azure ARM Type                                          | Source |
| ---------- | ------------------------------ | ------------------------------------------------------- | ------ |
| `aks`      | AKS cluster                    | `Microsoft.ContainerService/managedClusters`            | CAF    |
| `ca`       | Container app                  | `Microsoft.App/containerApps`                           | CAF    |
| `cae`      | Container Apps environment     | `Microsoft.App/managedEnvironments`                     | CAF    |
| `caj`      | Container apps job             | `Microsoft.App/jobs`                                    | CAF    |
| `ci`       | Container instance             | `Microsoft.ContainerInstance/containerGroups`           | CAF    |
| `cr`       | Container registry             | `Microsoft.ContainerRegistry/registries`                | CAF    |
| `np`       | AKS user node pool             | `Microsoft.ContainerService/managedClusters/agentPools` | CAF    |
| `npsystem` | AKS system node pool           | `Microsoft.ContainerService/managedClusters/agentPools` | CAF    |
| `sf`       | Service Fabric cluster         | `Microsoft.ServiceFabric/clusters`                      | CAF    |
| `sfmc`     | Service Fabric managed cluster | `Microsoft.ServiceFabric/managedClusters`               | CAF    |

### Databases

| Token    | Asset Type                          | Azure ARM Type                                       | Source   |
| -------- | ----------------------------------- | ---------------------------------------------------- | -------- |
| `amr`    | Azure Managed Redis                 | `Microsoft.Cache/RedisEnterprise`                    | CAF      |
| `cosmos` | Azure Cosmos DB database            | `Microsoft.DocumentDB/databaseAccounts/sqlDatabases` | CAF      |
| `coscas` | Azure Cosmos DB for Cassandra       | `Microsoft.DocumentDB/databaseAccounts`              | CAF      |
| `cosgrm` | Azure Cosmos DB for Gremlin         | `Microsoft.DocumentDB/databaseAccounts`              | CAF      |
| `cosmon` | Azure Cosmos DB for MongoDB         | `Microsoft.DocumentDB/databaseAccounts`              | CAF      |
| `cosno`  | Azure Cosmos DB for NoSQL           | `Microsoft.DocumentDB/databaseAccounts`              | CAF      |
| `cospos` | Azure Cosmos DB PostgreSQL cluster  | `Microsoft.DBforPostgreSQL/serverGroupsv2`           | CAF      |
| `costab` | Azure Cosmos DB for Table           | `Microsoft.DocumentDB/databaseAccounts`              | CAF      |
| `dms`    | Database Migration Service instance | `Microsoft.DataMigration/services`                   | CAF      |
| `mysql`  | MySQL database                      | `Microsoft.DBforMySQL/servers`                       | CAF      |
| `psql`   | PostgreSQL database                 | `Microsoft.DBforPostgreSQL/servers`                  | CAF      |
| `redis`  | Azure Cache for Redis               | `Microsoft.Cache/redis`                              | Esposter |
| `sql`    | Azure SQL Database server           | `Microsoft.Sql/servers`                              | CAF      |
| `sqldb`  | Azure SQL database                  | `Microsoft.Sql/servers/databases`                    | CAF      |
| `sqlep`  | SQL Elastic Pool                    | `Microsoft.Sql/servers/elasticpool`                  | CAF      |
| `sqlja`  | SQL Elastic Job agent               | `Microsoft.Sql/servers/jobAgents`                    | CAF      |
| `sqlmi`  | SQL Managed Instance                | `Microsoft.Sql/managedInstances`                     | CAF      |

### Developer tools

| Token   | Asset Type              | Azure ARM Type                                   | Source |
| ------- | ----------------------- | ------------------------------------------------ | ------ |
| `appcs` | App Configuration store | `Microsoft.AppConfiguration/configurationStores` | CAF    |
| `ia`    | Integration account     | `Microsoft.Logic/integrationAccounts`            | CAF    |
| `map`   | Maps account            | `Microsoft.Maps/accounts`                        | CAF    |
| `sigr`  | SignalR                 | `Microsoft.SignalRService/SignalR`               | CAF    |

### DevOps

| Token | Asset Type            | Azure ARM Type                         | Source |
| ----- | --------------------- | -------------------------------------- | ------ |
| `amg` | Azure Managed Grafana | `Microsoft.Dashboard/grafana`          | CAF    |
| `mdp` | Managed DevOps Pools  | `Microsoft.DevOpsInfrastructure/pools` | CAF    |

### Integration

| Token  | Asset Type                     | Azure ARM Type                                         | Source |
| ------ | ------------------------------ | ------------------------------------------------------ | ------ |
| `apim` | API Management service         | `Microsoft.ApiManagement/service`                      | CAF    |
| `sbns` | Service Bus namespace          | `Microsoft.ServiceBus/namespaces`                      | CAF    |
| `sbq`  | Service Bus queue              | `Microsoft.ServiceBus/namespaces/queues`               | CAF    |
| `sbt`  | Service Bus topic              | `Microsoft.ServiceBus/namespaces/topics`               | CAF    |
| `sbts` | Service Bus topic subscription | `Microsoft.ServiceBus/namespaces/topics/subscriptions` | CAF    |

### Management and governance

| Token    | Asset Type                          | Azure ARM Type                                   | Source   |
| -------- | ----------------------------------- | ------------------------------------------------ | -------- |
| `a`      | Azure Monitor action                | Action group receiver, not a standalone resource | Esposter |
| `aa`     | Automation account                  | `Microsoft.Automation/automationAccounts`        | CAF      |
| `apr`    | Azure Monitor alert processing rule | `Microsoft.AlertsManagement/actionRules`         | CAF      |
| `bp`     | Blueprint                           | `Microsoft.Blueprint/blueprints`                 | Esposter |
| `bpa`    | Blueprint assignment                | `Microsoft.Blueprint/blueprintAssignments`       | Esposter |
| `dce`    | Data collection endpoint            | `Microsoft.Insights/dataCollectionEndpoints`     | CAF      |
| `dcr`    | Azure Monitor data collection rule  | `Microsoft.Insights/dataCollectionRules`         | CAF      |
| `mg`     | Management group                    | `Microsoft.Management/managementGroups`          | CAF      |
| `pack`   | Log Analytics query packs           | `Microsoft.OperationalInsights/querypacks`       | CAF      |
| `policy` | Policy definition                   | `Microsoft.Authorization/policyDefinitions`      | Esposter |
| `pview`  | Microsoft Purview instance          | `Microsoft.Purview/accounts`                     | CAF      |
| `script` | Deployment scripts                  | `Microsoft.Resources/deploymentScripts`          | CAF      |
| `ts`     | Template specs                      | `Microsoft.Resources/templateSpecs`              | CAF      |

### Migration

| Token  | Asset Type              | Azure ARM Type                         | Source |
| ------ | ----------------------- | -------------------------------------- | ------ |
| `migr` | Azure Migrate project   | `Microsoft.Migrate/assessmentProjects` | CAF    |
| `rsv`  | Recovery Services vault | `Microsoft.RecoveryServices/vaults`    | CAF    |

### Networking

| Token    | Asset Type                             | Azure ARM Type                                              | Source |
| -------- | -------------------------------------- | ----------------------------------------------------------- | ------ |
| `afd`    | Front Door (Standard/Premium/classic)  | `Microsoft.Cdn/profiles`                                    | CAF    |
| `afwp`   | Azure Firewall policy                  | `Microsoft.Network/firewallPolicies`                        | CAF    |
| `agw`    | Application gateway                    | `Microsoft.Network/applicationGateways`                     | CAF    |
| `asg`    | Application security group             | `Microsoft.Network/applicationSecurityGroups`               | CAF    |
| `bas`    | Azure Bastion                          | `Microsoft.Network/bastionHosts`                            | CAF    |
| `cdne`   | CDN endpoint                           | `Microsoft.Cdn/profiles/endpoints`                          | CAF    |
| `cdnp`   | CDN profile                            | `Microsoft.Cdn/profiles`                                    | CAF    |
| `con`    | Connection                             | `Microsoft.Network/connections`                             | CAF    |
| `erc`    | ExpressRoute circuit                   | `Microsoft.Network/expressRouteCircuits`                    | CAF    |
| `erd`    | ExpressRoute direct                    | `Microsoft.Network/expressRoutePorts`                       | CAF    |
| `ergw`   | ExpressRoute gateway                   | `Microsoft.Network/virtualNetworkGateways`                  | CAF    |
| `fde`    | Front Door endpoint                    | `Microsoft.Cdn/profiles/afdEndpoints`                       | CAF    |
| `fdfp`   | Front Door firewall policy             | `Microsoft.Network/frontdoorWebApplicationFirewallPolicies` | CAF    |
| `in`     | DNS private resolver inbound endpoint  | `Microsoft.Network/dnsResolvers/inboundEndpoints`           | CAF    |
| `ipg`    | IP group                               | `Microsoft.Network/ipGroups`                                | CAF    |
| `lbe`    | Load balancer (external)               | `Microsoft.Network/loadBalancers`                           | CAF    |
| `lbi`    | Load balancer (internal)               | `Microsoft.Network/loadBalancers`                           | CAF    |
| `lgw`    | Local network gateway                  | `Microsoft.Network/localNetworkGateways`                    | CAF    |
| `ng`     | NAT gateway                            | `Microsoft.Network/natGateways`                             | CAF    |
| `nic`    | Network interface                      | `Microsoft.Network/networkInterfaces`                       | CAF    |
| `nsg`    | Network security group                 | `Microsoft.Network/networkSecurityGroups`                   | CAF    |
| `nsgsr`  | NSG security rules                     | `Microsoft.Network/networkSecurityGroups/securityRules`     | CAF    |
| `nsp`    | Network security perimeter             | `Microsoft.Network/networkSecurityPerimeters`               | CAF    |
| `nw`     | Network Watcher                        | `Microsoft.Network/networkWatchers`                         | CAF    |
| `out`    | DNS private resolver outbound endpoint | `Microsoft.Network/dnsResolvers/outboundEndpoints`          | CAF    |
| `pep`    | Private endpoint                       | `Microsoft.Network/privateEndpoints`                        | CAF    |
| `peer`   | Virtual network peering                | `Microsoft.Network/virtualNetworks/virtualNetworkPeerings`  | CAF    |
| `pip`    | Public IP address                      | `Microsoft.Network/publicIPAddresses`                       | CAF    |
| `pl`     | Private Link                           | `Microsoft.Network/privateLinkServices`                     | CAF    |
| `pls`    | Azure Arc private link scope           | `Microsoft.HybridCompute/privateLinkScopes`                 | CAF    |
| `rf`     | Route filter                           | `Microsoft.Network/routeFilters`                            | CAF    |
| `rt`     | Route table                            | `Microsoft.Network/routeTables`                             | CAF    |
| `rtserv` | Route server                           | `Microsoft.Network/virtualHubs`                             | CAF    |
| `se`     | Service endpoint policy                | `Microsoft.Network/serviceEndPointPolicies`                 | CAF    |
| `snet`   | Subnet                                 | `Microsoft.Network/virtualNetworks/subnets`                 | CAF    |
| `traf`   | Traffic Manager profile                | `Microsoft.Network/trafficManagerProfiles`                  | CAF    |
| `udr`    | User defined route                     | `Microsoft.Network/routeTables/routes`                      | CAF    |
| `vcn`    | VPN connection                         | `Microsoft.Network/vpnGateways/vpnConnections`              | CAF    |
| `vgw`    | Virtual network gateway                | `Microsoft.Network/virtualNetworkGateways`                  | CAF    |
| `vhub`   | Virtual WAN Hub                        | `Microsoft.Network/virtualHubs`                             | CAF    |
| `vnet`   | Virtual network                        | `Microsoft.Network/virtualNetworks`                         | CAF    |
| `vnm`    | Virtual network manager                | `Microsoft.Network/networkManagers`                         | CAF    |
| `vpng`   | VPN Gateway                            | `Microsoft.Network/vpnGateways`                             | CAF    |
| `vst`    | VPN site                               | `Microsoft.Network/vpnGateways/vpnSites`                    | CAF    |
| `vwan`   | Virtual WAN                            | `Microsoft.Network/virtualWans`                             | CAF    |
| `waf`    | Web Application Firewall policy        | `Microsoft.Network/firewallPolicies`                        | CAF    |
| `wafrg`  | WAF policy rule group                  | `Microsoft.Network/firewallPolicies/ruleGroups`             | CAF    |

### Security

| Token    | Asset Type            | Azure ARM Type                                     | Source |
| -------- | --------------------- | -------------------------------------------------- | ------ |
| `id`     | Managed identity      | `Microsoft.ManagedIdentity/userAssignedIdentities` | CAF    |
| `kv`     | Key vault             | `Microsoft.KeyVault/vaults`                        | CAF    |
| `kvmhsm` | Key Vault Managed HSM | `Microsoft.KeyVault/managedHSMs`                   | CAF    |
| `sshkey` | SSH key               | `Microsoft.Compute/sshPublicKeys`                  | CAF    |

### Storage

| Token    | Asset Type                  | Azure ARM Type                                          | Source |
| -------- | --------------------------- | ------------------------------------------------------- | ------ |
| `bkpol`  | Backup Vault policy         | `Microsoft.DataProtection/backupVaults/backupPolicies`  | CAF    |
| `bvault` | Backup Vault                | `Microsoft.DataProtection/backupVaults`                 | CAF    |
| `rgd`    | Azure Backup Resource Guard | `Microsoft.DataProtection/resourceGuards`               | CAF    |
| `share`  | File share                  | `Microsoft.Storage/storageAccounts/fileServices/shares` | CAF    |
| `sss`    | Storage Sync Service        | `Microsoft.StorageSync/storageSyncServices`             | CAF    |

### Synapse Analytics

| Token    | Asset Type                        | Azure ARM Type                              | Source |
| -------- | --------------------------------- | ------------------------------------------- | ------ |
| `syndp`  | Azure Synapse SQL Dedicated Pool  | `Microsoft.Synapse/workspaces/sqlPools`     | CAF    |
| `synplh` | Azure Synapse private link hub    | `Microsoft.Synapse/privateLinkHubs`         | CAF    |
| `synsp`  | Azure Synapse Spark Pool          | `Microsoft.Synapse/workspaces/bigDataPools` | CAF    |
| `synw`   | Azure Synapse Analytics workspace | `Microsoft.Synapse/workspaces`              | CAF    |

### Virtual desktop infrastructure

| Token       | Asset Type                        | Azure ARM Type                                      | Source |
| ----------- | --------------------------------- | --------------------------------------------------- | ------ |
| `vdag`      | Virtual desktop application group | `Microsoft.DesktopVirtualization/applicationGroups` | CAF    |
| `vdpool`    | Virtual desktop host pool         | `Microsoft.DesktopVirtualization/hostPools`         | CAF    |
| `vdscaling` | Virtual desktop scaling plan      | `Microsoft.DesktopVirtualization/scalingPlans`      | CAF    |
| `vdws`      | Virtual desktop workspace         | `Microsoft.DesktopVirtualization/workspaces`        | CAF    |

### Notes

- `a` (Azure Monitor action) — concept token, not a standalone Azure resource; behavior belongs inside the owning action group
- `amr` vs `redis` — CAF defines `amr` for Azure Managed Redis (`Microsoft.Cache/RedisEnterprise`); `redis` is an Esposter token for standard Azure Cache for Redis (`Microsoft.Cache/redis`) which CAF does not currently abbreviate
- `bp` / `bpa` — Azure Blueprints is deprecated; use Template Specs (`ts`) for new work
- `policy` — CAF recommends descriptive names for policy definitions rather than a fixed abbreviation; `policy` is Esposter-defined for cases where a short token is needed
- `ergw` vs `vgw` — both map to `Microsoft.Network/virtualNetworkGateways`; `ergw` is the CAF token for ExpressRoute gateways specifically, `vgw` is for VPN/general virtual network gateways
- `afwp` vs `waf` — both map to `Microsoft.Network/firewallPolicies`; `afwp` is for Azure Firewall policies, `waf` is for Web Application Firewall policies

## Examples

| Resource Type           | Legacy Name                      | Target Name                 |
| ----------------------- | -------------------------------- | --------------------------- |
| Resource group          | `p-shp-rg-esposter-auea-001`     | `prod-rg-esposter-ae-001`   |
| Function app            | `p-shp-func-esposter-auea-001`   | `prod-func-esposter-001`    |
| Storage account         | `pshpstespauea001`               | `prodstesposter001`         |
| Azure AI Search         | `pshpsrchespauea001`             | `prod-srch-esposter-001`    |
| Event Grid subscription | `p-shp-evgts-esposter-auea-001`  | `prod-evgs-esposter-ae-001` |
| Web PubSub              | `p-shp-pubsub-esposter-auea-001` | `prod-wps-esposter-001`     |

## Source File Names

One resource declaration per file. Pulumi source files use lower camel case derived from the naming components, not a character-for-character copy of the Azure resource name. This keeps compact Azure names readable in TypeScript.

The export constant name must match the file name minus `.ts`.

Target examples:

| Azure Resource Name       | Naming Components                     | Source File              | Export Constant       |
| ------------------------- | ------------------------------------- | ------------------------ | --------------------- |
| `prod-rg-esposter-ae-001` | `prod`, `rg`, `esposter`, `Ae`, `001` | `prodRgEsposterAe001.ts` | `prodRgEsposterAe001` |
| `prod-func-esposter-001`  | `prod`, `func`, `esposter`, `001`     | `prodFuncEsposter001.ts` | `prodFuncEsposter001` |
| `prodstesposter001`       | `prod`, `st`, `esposter`, `001`       | `prodStEsposter001.ts`   | `prodStEsposter001`   |
| `prod-srch-esposter-001`  | `prod`, `srch`, `esposter`, `001`     | `prodSrchEsposter001.ts` | `prodSrchEsposter001` |

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
