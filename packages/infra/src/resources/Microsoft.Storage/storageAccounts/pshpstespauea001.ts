import Pshpstespauea001Name from "@/constants/Pshpstespauea001Name";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const pshpstespauea001: azure_native.storage.StorageAccount = new azure_native.storage.StorageAccount(
  Pshpstespauea001Name,
  {
    accessTier: azure_native.storage.AccessTier.Hot,
    accountName: Pshpstespauea001Name,
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
    location: "australiaeast",
    minimumTlsVersion: azure_native.storage.MinimumTlsVersion.TLS1_2,
    networkRuleSet: {
      bypass: azure_native.storage.Bypass.AzureServices,
      defaultAction: azure_native.storage.DefaultAction.Allow,
      ipRules: [],
      virtualNetworkRules: [],
    },
    publicNetworkAccess: azure_native.storage.PublicNetworkAccess.Enabled,
    resourceGroupName: pShpRgEsposterAuea001.name,
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
