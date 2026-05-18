import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import { devLogEsposterAuea001 } from "@/resources/Microsoft.OperationalInsights/workspaces/devLogEsposterAuea001";
import { devRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

const resourceName = "dev-appi-esposter-auea-001";

export const devAppiEsposterAuea001: azure_native.applicationinsights.Component =
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
      resourceGroupName: devRgEsposterAuea001.name,
      resourceName,
      retentionInDays: 90,
      tags: {
        ...ApplicationTags,
      },
      workspaceResourceId: devLogEsposterAuea001.id,
    },
    {
      parent: devRgEsposterAuea001,
      protect: true,
    },
  );
