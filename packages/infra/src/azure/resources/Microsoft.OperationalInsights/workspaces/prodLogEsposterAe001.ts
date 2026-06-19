import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const workspaceName = "prod-log-esposter-ae-001";

export const prodLogEsposterAe001: azure_native.operationalinsights.Workspace =
  new azure_native.operationalinsights.Workspace(
    workspaceName,
    {
      features: {
        enableLogAccessUsingOnlyResourcePermissions: true,
      },
      location: AzureAustraliaEastLocation,
      publicNetworkAccessForIngestion: azure_native.operationalinsights.PublicNetworkAccessType.Enabled,
      publicNetworkAccessForQuery: azure_native.operationalinsights.PublicNetworkAccessType.Enabled,
      resourceGroupName: prodRgEsposterAe001.name,
      retentionInDays: 30,
      sku: {
        name: "pergb2018",
      },
      tags: {
        ...ApplicationTags,
      },
      workspaceCapping: {
        dailyQuotaGb: -1,
      },
      workspaceName,
    },
    {
      parent: prodRgEsposterAe001,
      protect: true,
    },
  );
