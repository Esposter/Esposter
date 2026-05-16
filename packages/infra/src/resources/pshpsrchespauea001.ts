import * as azure_native from "@pulumi/azure-native";

export const pshpsrchespauea001: azure_native.search.Service = new azure_native.search.Service(
  "pshpsrchespauea001",
  {
    computeType: azure_native.search.ComputeType.Default,
    disableLocalAuth: false,
    encryptionWithCmk: {
      enforcement: azure_native.search.SearchEncryptionWithCmk.Unspecified,
    },
    endpoint: "https://pshpsrchespauea001.search.windows.net",
    hostingMode: azure_native.search.HostingMode.Default,
    identity: {
      type: azure_native.search.IdentityType.SystemAssigned,
    },
    location: "Australia East",
    networkRuleSet: {
      bypass: azure_native.search.SearchBypass.None,
    },
    partitionCount: 1,
    publicNetworkAccess: azure_native.search.PublicNetworkAccess.Enabled,
    replicaCount: 1,
    resourceGroupName: "p-shp-rg-esposter-auea-001",
    searchServiceName: "pshpsrchespauea001",
    semanticSearch: azure_native.search.SearchSemanticSearch.Disabled,
    sku: {
      name: azure_native.search.SkuName.Free,
    },
    tags: {
      Application: "Esposter",
    },
    upgradeAvailable: azure_native.search.UpgradeAvailable.NotAvailable,
  },
  {
    protect: true,
  },
);
