import * as azure_native from "@pulumi/azure-native";

export const pShpAgEsposterAuea001: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  "p-shp-ag-esposter-auea-001",
  {
    actionGroupName: "p-shp-ag-esposter-auea-001",
    enabled: true,
    groupShortName: "StopFunction",
    location: "Global",
    logicAppReceivers: [
      {
        callbackUrl:
          "https://prod-04.australiaeast.logic.azure.com:443/workflows/f9a8f2ee90694531b1817249a39104b4/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=UiF6fOKD-Fs8ZE8h6PODKr3vJ8Ah53iOp6FTNNiwab0",
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
