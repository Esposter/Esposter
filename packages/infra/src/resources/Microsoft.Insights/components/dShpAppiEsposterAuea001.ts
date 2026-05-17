import * as azure_native from "@pulumi/azure-native";

import { dShpLogEsposterAuea001 } from "../../Microsoft.OperationalInsights/workspaces/dShpLogEsposterAuea001";

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
      workspaceResourceId: dShpLogEsposterAuea001.id,
    },
    {
      protect: true,
    },
  );
