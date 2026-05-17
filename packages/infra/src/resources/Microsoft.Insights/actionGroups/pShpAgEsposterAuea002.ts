import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const pShpAgEsposterAuea002: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  "p-shp-ag-esposter-auea-002",
  {
    actionGroupName: "p-shp-ag-esposter-auea-002",
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
    location: "Global",
    resourceGroupName: pShpRgEsposterAuea001.name,
    tags: {
      Application: "Esposter",
    },
  },
  {
    protect: true,
  },
);
