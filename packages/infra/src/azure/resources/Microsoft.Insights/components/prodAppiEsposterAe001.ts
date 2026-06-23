import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import { prodLogEsposterAe001 } from "@/azure/resources/Microsoft.OperationalInsights/workspaces/prodLogEsposterAe001";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const resourceName = "prod-appi-esposter-ae-001";

export const prodAppiEsposterAe001: azure_native.applicationinsights.Component =
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
      resourceGroupName: prodRgEsposterAe001.name,
      resourceName,
      retentionInDays: 90,
      tags: {
        ...ApplicationTags,
      },
      workspaceResourceId: prodLogEsposterAe001.id,
    },
    {
      parent: prodRgEsposterAe001,
      protect: true,
    },
  );
