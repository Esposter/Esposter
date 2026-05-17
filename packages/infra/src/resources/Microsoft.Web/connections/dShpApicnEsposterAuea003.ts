import * as azure_native from "@pulumi/azure-native";

export const dShpApicnEsposterAuea003: azure_native.web.Connection = new azure_native.web.Connection(
  "d-shp-apicn-esposter-auea-003",
  {
    connectionName: "arm",
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
      displayName: "d-shp-apicn-esposter-auea-003",
    },
    resourceGroupName: "d-shp-rg-esposter-auea-001",
    tags: {
      Application: "Esposter",
    },
  },
  {
    protect: true,
  },
);
