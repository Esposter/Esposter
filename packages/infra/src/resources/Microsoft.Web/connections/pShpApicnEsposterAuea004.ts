import * as azure_native from "@pulumi/azure-native";

export const pShpApicnEsposterAuea004: azure_native.web.Connection = new azure_native.web.Connection(
  "p-shp-apicn-esposter-auea-004",
  {
    connectionName: "arm-1",
    location: "australiaeast",
    properties: {
      api: {
        brandColor: "",
        description: "Azure Resource Manager exposes the APIs to manage all of your Azure resources.",
        displayName: "Azure Resource Manager",
        iconUri: "https://conn-afd-prod-endpoint-bmc9bqahasf3grgk.b01.azurefd.net/v1.0.1751/1.0.1751.4207/arm/icon.png",
        id: "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/providers/Microsoft.Web/locations/australiaeast/managedApis/arm",
        name: "arm",
        type: "Microsoft.Web/locations/managedApis",
      },
      changedTime: "2025-11-05T02:07:52.386187Z",
      createdTime: "2025-11-05T01:58:44.7030329Z",
      displayName: "p-shp-apicn-esposter-auea-004",
      statuses: [
        {
          status: "Ready",
        },
      ],
    },
    resourceGroupName: "p-shp-rg-esposter-auea-001",
    tags: {
      Application: "Esposter",
    },
  },
  {
    protect: true,
  },
);
