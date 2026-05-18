import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import { dShpLogEsposterAuea001 } from "@/resources/Microsoft.OperationalInsights/workspaces/dShpLogEsposterAuea001";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const dShpAppiEsposterAuea001: azure_native.applicationinsights.Component =
  new azure_native.applicationinsights.Component(
    "d-shp-appi-esposter-auea-001",
    {
      applicationType: azure_native.applicationinsights.ApplicationType.Web,
      flowType: "Redfield",
      ingestionMode: azure_native.applicationinsights.IngestionMode.LogAnalytics,
      kind: "web",
      location: AzureAustraliaEastLocation,
      publicNetworkAccessForIngestion: azure_native.applicationinsights.PublicNetworkAccessType.Enabled,
      publicNetworkAccessForQuery: azure_native.applicationinsights.PublicNetworkAccessType.Enabled,
      requestSource: "IbizaAIExtension",
      resourceGroupName: dShpRgEsposterAuea001.name,
      resourceName: "d-shp-appi-esposter-auea-001",
      retentionInDays: 90,
      tags: {
        ...ApplicationTags,
      },
      workspaceResourceId: dShpLogEsposterAuea001.id,
    },
    {
      protect: true,
    },
  );
