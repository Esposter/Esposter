import * as azure_native from "@pulumi/azure-native";

export const dshpstespauea001: azure_native.storage.StorageAccount = new azure_native.storage.StorageAccount(
  "dshpstespauea001",
  {
    accessTier: azure_native.storage.AccessTier.Hot,
    accountName: "dshpstespauea001",
    allowBlobPublicAccess: true,
    allowCrossTenantReplication: false,
    allowSharedKeyAccess: true,
    defaultToOAuthAuthentication: false,
    dnsEndpointType: azure_native.storage.DnsEndpointType.Standard,
    enableHttpsTrafficOnly: true,
    encryption: {
      keySource: azure_native.storage.KeySource.Microsoft_Storage,
      requireInfrastructureEncryption: true,
      services: {
        blob: {
          enabled: true,
          keyType: azure_native.storage.KeyType.Account,
        },
        file: {
          enabled: true,
          keyType: azure_native.storage.KeyType.Account,
        },
      },
    },
    kind: azure_native.storage.Kind.StorageV2,
    location: "australiaeast",
    minimumTlsVersion: azure_native.storage.MinimumTlsVersion.TLS1_2,
    networkRuleSet: {
      bypass: azure_native.storage.Bypass.AzureServices,
      defaultAction: azure_native.storage.DefaultAction.Allow,
      ipRules: [
        {
          action: azure_native.storage.Action.Allow,
          iPAddressOrRange: "172.212.169.145",
        },
      ],
    },
    publicNetworkAccess: azure_native.storage.PublicNetworkAccess.Enabled,
    resourceGroupName: "d-shp-rg-esposter-auea-001",
    sku: {
      name: azure_native.storage.SkuName.Standard_LRS,
    },
    tags: {
      Application: "Esposter",
    },
  },
  {
    protect: true,
  },
);
