import * as azure_native from "@pulumi/azure-native";

export const pShpAgEsposterAuea003: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  "p-shp-ag-esposter-auea-003",
  {
    actionGroupName: "p-shp-ag-esposter-auea-003",
    enabled: true,
    groupShortName: "DeleteSub",
    location: "Global",
    logicAppReceivers: [
      {
        callbackUrl:
          "https://prod-05.australiaeast.logic.azure.com:443/workflows/be8da2712bf74aa3873ece4255116813/triggers/When_Budget_Action_is_received/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2FWhen_Budget_Action_is_received%2Frun&sv=1.0&sig=oUea9hcUz7cLlgzgUjIrqCIm6FOx4tJHgFA6GBZ-YVU",
        name: "p-shp-a-esposter-auea-002",
        resourceId:
          "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/p-shp-rg-esposter-auea-001/providers/Microsoft.Logic/workflows/p-shp-logic-esposter-auea-003",
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
