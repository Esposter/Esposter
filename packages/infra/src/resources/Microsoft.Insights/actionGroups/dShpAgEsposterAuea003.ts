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
        resourceId:
          "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.Logic/workflows/d-shp-logic-esposter-auea-003",
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
