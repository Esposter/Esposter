import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastDisplayLocation from "@/constants/AzureAustraliaEastDisplayLocation";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const dshpsrchespauea001: azure_native.search.Service = new azure_native.search.Service(
  "dshpsrchespauea001",
  {
    computeType: azure_native.search.ComputeType.Default,
    disableLocalAuth: false,
    encryptionWithCmk: {
      enforcement: azure_native.search.SearchEncryptionWithCmk.Unspecified,
    },
    endpoint: "https://dshpsrchespauea001.search.windows.net",
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
    resourceGroupName: dShpRgEsposterAuea001.name,
    searchServiceName: "dshpsrchespauea001",
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
    protect: true,
  },
);
