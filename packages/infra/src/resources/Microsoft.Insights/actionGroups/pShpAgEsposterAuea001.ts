import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const pShpAgEsposterAuea001: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  "p-shp-ag-esposter-auea-001",
  {
    actionGroupName: "p-shp-ag-esposter-auea-001",
    enabled: true,
    groupShortName: "StopFunction",
    location: "Global",
    logicAppReceivers: [
      {
        callbackUrl: config.requireSecret("pShpAgEsposterAuea001CallbackUrl"),
        name: "p-shp-a-esposter-auea-001",
        resourceId:
          "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/p-shp-rg-esposter-auea-001/providers/Microsoft.Logic/workflows/p-shp-logic-esposter-auea-001",
        useCommonAlertSchema: true,
      },
    ],
    resourceGroupName: "p-shp-rg-esposter-auea-001",
    tags: {
      Application: "Esposter",
    },
  },
  {
    protect: true,
  },
);
