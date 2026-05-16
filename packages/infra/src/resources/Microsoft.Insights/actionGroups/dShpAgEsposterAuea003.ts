import * as azure_native from "@pulumi/azure-native";

export const dShpAgEsposterAuea003: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  "d-shp-ag-esposter-auea-003",
  {
    actionGroupName: "d-shp-ag-esposter-auea-003",
    enabled: true,
    groupShortName: "DeleteSub",
    location: "Global",
    logicAppReceivers: [
      {
        callbackUrl:
          "https://prod-20.austriaeast.logic.azure.com:443/workflows/7b3cf22515a347ab8115a581a09ca5a5/triggers/When_Budget_Action_is_received/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2FWhen_Budget_Action_is_received%2Frun&sv=1.0&sig=bPne4qGYFv3ZNSRZP4ESae8XMmJd8gHQ--8bSInKb9w",
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
