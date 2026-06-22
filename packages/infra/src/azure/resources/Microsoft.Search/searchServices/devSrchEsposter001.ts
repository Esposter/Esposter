import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastDisplayLocation from "@/azure/constants/AzureAustraliaEastDisplayLocation";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const searchServiceName = "dev-srch-esposter-001";

export const devSrchEsposter001: azure_native.search.Service = new azure_native.search.Service(
  searchServiceName,
  {
    computeType: azure_native.search.ComputeType.Default,
    disableLocalAuth: false,
    encryptionWithCmk: {
      enforcement: azure_native.search.SearchEncryptionWithCmk.Unspecified,
    },
    endpoint: "https://dev-srch-esposter-001.search.windows.net",
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
    resourceGroupName: devRgEsposterAe001.name,
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
    parent: devRgEsposterAe001,
    protect: true,
  },
);
