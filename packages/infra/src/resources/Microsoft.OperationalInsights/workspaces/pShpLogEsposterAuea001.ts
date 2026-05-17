import * as azure_native from "@pulumi/azure-native";

export const pShpLogEsposterAuea001: azure_native.operationalinsights.Workspace =
  new azure_native.operationalinsights.Workspace(
    "p-shp-log-esposter-auea-001",
    {
      features: {
        enableLogAccessUsingOnlyResourcePermissions: true,
      },
      location: "australiaeast",
      publicNetworkAccessForIngestion: azure_native.operationalinsights.PublicNetworkAccessType.Enabled,
      publicNetworkAccessForQuery: azure_native.operationalinsights.PublicNetworkAccessType.Enabled,
      resourceGroupName: "p-shp-rg-esposter-auea-001",
      retentionInDays: 30,
      sku: {
        name: "pergb2018",
      },
      tags: {
        Application: "Esposter",
      },
      workspaceCapping: {
        dailyQuotaGb: -1,
      },
      workspaceName: "p-shp-log-esposter-auea-001",
    },
    {
      protect: true,
    },
  );
