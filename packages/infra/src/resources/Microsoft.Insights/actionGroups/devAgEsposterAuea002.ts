import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalDisplayLocation from "@/constants/AzureGlobalDisplayLocation";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

const actionGroupName = "dev-ag-esposter-auea-002";

export const devAgEsposterAuea002: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  actionGroupName,
  {
    actionGroupName,
    armRoleReceivers: [
      {
        name: "Monitoring Contributor",
        roleId: "749f88d5-cbae-40b8-bcfc-e573ddc772fa",
        useCommonAlertSchema: true,
      },
      {
        name: "Monitoring Reader",
        roleId: "43d0d8ad-25c7-4714-9337-8ba259a9fe05",
        useCommonAlertSchema: true,
      },
    ],
    enabled: true,
    groupShortName: "SmartDetect",
    location: AzureGlobalDisplayLocation,
    resourceGroupName: dShpRgEsposterAuea001.name,
    tags: {
      ...ApplicationTags,
    },
  },
  {
    protect: true,
  },
);
