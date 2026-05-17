import { dShpLogicEsposterAuea001 } from "@/resources/Microsoft.Logic/workflows/dShpLogicEsposterAuea001";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const dShpAgEsposterAuea001: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  "d-shp-ag-esposter-auea-001",
  {
    actionGroupName: "d-shp-ag-esposter-auea-001",
    enabled: true,
    groupShortName: "StopFunction",
    location: "Global",
    logicAppReceivers: [
      {
        callbackUrl: config.requireSecret("dShpAgEsposterAuea001CallbackUrl"),
        name: "d-shp-a-esposter-auea-001",
        resourceId: dShpLogicEsposterAuea001.id,
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
