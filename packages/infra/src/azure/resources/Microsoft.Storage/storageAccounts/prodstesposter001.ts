import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const accountName = "prodstesposter001";

export const prodstesposter001: azure_native.storage.StorageAccount = new azure_native.storage.StorageAccount(
  accountName,
  {
    accessTier: azure_native.storage.AccessTier.Hot,
    accountName,
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
    largeFileSharesState: azure_native.storage.LargeFileSharesState.Enabled,
    location: AzureAustraliaEastLocation,
    minimumTlsVersion: azure_native.storage.MinimumTlsVersion.TLS1_2,
    networkRuleSet: {
      bypass: azure_native.storage.Bypass.AzureServices,
      defaultAction: azure_native.storage.DefaultAction.Allow,
      ipRules: [],
      virtualNetworkRules: [],
    },
    publicNetworkAccess: azure_native.storage.PublicNetworkAccess.Enabled,
    resourceGroupName: prodRgEsposterAe001.name,
    sku: {
      name: azure_native.storage.SkuName.Standard_LRS,
    },
    tags: {
      ...ApplicationTags,
    },
  },
  {
    parent: prodRgEsposterAe001,
    protect: true,
  },
);
