import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
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
      resourceGroupName: pShpRgEsposterAuea001.name,
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
