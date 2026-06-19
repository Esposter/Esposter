import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastDisplayLocation from "@/azure/constants/AzureAustraliaEastDisplayLocation";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const searchServiceName = "prod-srch-esposter-001";

export const prodSrchEsposter001: azure_native.search.Service = new azure_native.search.Service(
  searchServiceName,
  {
    computeType: azure_native.search.ComputeType.Default,
    disableLocalAuth: false,
    encryptionWithCmk: {
      enforcement: azure_native.search.SearchEncryptionWithCmk.Unspecified,
    },
    endpoint: "https://prod-srch-esposter-001.search.windows.net",
    hostingMode: azure_native.search.HostingMode.Default,
    identity: {
      type: azure_native.search.IdentityType.SystemAssigned,
    },
    location: AzureAustraliaEastDisplayLocation,
    networkRuleSet: {
      bypass: azure_native.search.SearchBypass.None,
    },
    partitionCount: 1,
    publicNetworkAccess: azure_native.search.PublicNetworkAccess.Enabled,
    replicaCount: 1,
    resourceGroupName: prodRgEsposterAe001.name,
    searchServiceName,
    semanticSearch: azure_native.search.SearchSemanticSearch.Disabled,
    sku: {
      name: azure_native.search.SkuName.Free,
    },
    tags: {
      ...ApplicationTags,
    },
    upgradeAvailable: azure_native.search.UpgradeAvailable.NotAvailable,
  },
  {
    parent: prodRgEsposterAe001,
    protect: true,
  },
);
