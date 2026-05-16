import * as azure_native from "@pulumi/azure-native";

export const dShpAgEsposterAuea001: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  "d-shp-ag-esposter-auea-001",
  {
    actionGroupName: "d-shp-ag-esposter-auea-001",
    enabled: true,
    groupShortName: "StopFunction",
    location: "Global",
    logicAppReceivers: [
      {
        callbackUrl:
          "https://prod-21.australiaeast.logic.azure.com:443/workflows/0e0aa3053a91411184d90223f98cc890/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=yYVQX94KVNWN3cDJgtYGQqL_XoKP_0JC2j7NyWva69c",
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
