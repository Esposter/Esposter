import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import { pShpLogEsposterAuea001 } from "@/resources/Microsoft.OperationalInsights/workspaces/pShpLogEsposterAuea001";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

const resourceName = "p-shp-appi-esposter-auea-001";

export const pShpAppiEsposterAuea001: azure_native.applicationinsights.Component =
  new azure_native.applicationinsights.Component(
    resourceName,
    {
      applicationType: azure_native.applicationinsights.ApplicationType.Web,
      flowType: "Redfield",
      ingestionMode: azure_native.applicationinsights.IngestionMode.LogAnalytics,
      kind: "web",
      location: AzureAustraliaEastLocation,
      publicNetworkAccessForIngestion: azure_native.applicationinsights.PublicNetworkAccessType.Enabled,
      publicNetworkAccessForQuery: azure_native.applicationinsights.PublicNetworkAccessType.Enabled,
      requestSource: "IbizaAIExtension",
      resourceGroupName: pShpRgEsposterAuea001.name,
      resourceName,
      retentionInDays: 90,
      tags: {
        ...ApplicationTags,
      },
      workspaceResourceId: pShpLogEsposterAuea001.id,
    },
    {
      protect: true,
    },
  );
