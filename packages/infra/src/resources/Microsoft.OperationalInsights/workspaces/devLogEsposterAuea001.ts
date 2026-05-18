import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import { devRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

const workspaceName = "dev-log-esposter-auea-001";

export const devLogEsposterAuea001: azure_native.operationalinsights.Workspace =
  new azure_native.operationalinsights.Workspace(
    workspaceName,
    {
      features: {
        enableLogAccessUsingOnlyResourcePermissions: true,
      },
      location: AzureAustraliaEastLocation,
      publicNetworkAccessForIngestion: azure_native.operationalinsights.PublicNetworkAccessType.Enabled,
      publicNetworkAccessForQuery: azure_native.operationalinsights.PublicNetworkAccessType.Enabled,
      resourceGroupName: devRgEsposterAuea001.name,
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
      parent: devRgEsposterAuea001,
      protect: true,
    },
  );
