import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import { devLogEsposterAe001 } from "@/resources/Microsoft.OperationalInsights/workspaces/devLogEsposterAe001";
import { devRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const resourceName = "dev-appi-esposter-ae-001";

export const devAppiEsposterAe001: azure_native.applicationinsights.Component =
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
      resourceGroupName: devRgEsposterAe001.name,
      resourceName,
      retentionInDays: 90,
      tags: {
        ...ApplicationTags,
      },
      workspaceResourceId: devLogEsposterAe001.id,
    },
    {
      parent: devRgEsposterAe001,
      protect: true,
    },
  );
