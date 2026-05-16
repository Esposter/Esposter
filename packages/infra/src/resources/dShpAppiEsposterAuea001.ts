import * as azure_native from "@pulumi/azure-native";

export const dShpAppiEsposterAuea001: azure_native.applicationinsights.Component =
  new azure_native.applicationinsights.Component(
    "d-shp-appi-esposter-auea-001",
    {
      applicationType: azure_native.applicationinsights.ApplicationType.Web,
      flowType: "Redfield",
      ingestionMode: azure_native.applicationinsights.IngestionMode.LogAnalytics,
      kind: "web",
      location: "australiaeast",
      publicNetworkAccessForIngestion: azure_native.applicationinsights.PublicNetworkAccessType.Enabled,
      publicNetworkAccessForQuery: azure_native.applicationinsights.PublicNetworkAccessType.Enabled,
      requestSource: "IbizaAIExtension",
      resourceGroupName: "d-shp-rg-esposter-auea-001",
      resourceName: "d-shp-appi-esposter-auea-001",
      retentionInDays: 90,
      tags: {
        Application: "Esposter",
      },
      workspaceResourceId:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.OperationalInsights/workspaces/d-shp-log-esposter-auea-001",
    },
    {
      protect: true,
    },
  );
