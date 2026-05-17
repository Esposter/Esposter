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
        resourceId:
          "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.Logic/workflows/d-shp-logic-esposter-auea-001",
        useCommonAlertSchema: true,
      },
    ],
    resourceGroupName: "d-shp-rg-esposter-auea-001",
    tags: {
      Application: "Esposter",
    },
  },
  {
    protect: true,
  },
);
