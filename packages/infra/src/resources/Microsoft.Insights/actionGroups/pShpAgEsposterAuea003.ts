import { pShpLogicEsposterAuea003 } from "@/resources/Microsoft.Logic/workflows/pShpLogicEsposterAuea003";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const pShpAgEsposterAuea003: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  "p-shp-ag-esposter-auea-003",
  {
    actionGroupName: "p-shp-ag-esposter-auea-003",
    enabled: true,
    groupShortName: "DeleteSub",
    location: "Global",
    logicAppReceivers: [
      {
        callbackUrl: config.requireSecret("pShpAgEsposterAuea003CallbackUrl"),
        name: "p-shp-a-esposter-auea-002",
        resourceId: pShpLogicEsposterAuea003.id,
        useCommonAlertSchema: true,
      },
    ],
    resourceGroupName: pShpRgEsposterAuea001.name,
    tags: {
      Application: "Esposter",
    },
  },
  {
    protect: true,
  },
);
