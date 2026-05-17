import { dShpLogicEsposterAuea003 } from "@/resources/Microsoft.Logic/workflows/dShpLogicEsposterAuea003";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const dShpAgEsposterAuea003: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  "d-shp-ag-esposter-auea-003",
  {
    actionGroupName: "d-shp-ag-esposter-auea-003",
    enabled: true,
    groupShortName: "DeleteSub",
    location: "Global",
    logicAppReceivers: [
      {
        callbackUrl: config.requireSecret("dShpAgEsposterAuea003CallbackUrl"),
        name: "d-shp-a-esposter-auea-002",
        resourceId: dShpLogicEsposterAuea003.id,
        useCommonAlertSchema: true,
      },
    ],
    resourceGroupName: dShpRgEsposterAuea001.name,
    tags: {
      Application: "Esposter",
    },
  },
  {
    protect: true,
  },
);
