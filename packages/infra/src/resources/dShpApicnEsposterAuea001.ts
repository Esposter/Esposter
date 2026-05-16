import * as azure_native from "@pulumi/azure-native";

export const dShpApicnEsposterAuea001: azure_native.web.Connection = new azure_native.web.Connection(
  "d-shp-apicn-esposter-auea-001",
  {
    connectionName: "azureappservice-1",
    location: "australiaeast",
    properties: {
      api: {
        brandColor: "#FFFFFF",
        description:
          "Azure App Service connector allows you to manage app services and server farms in your subscription.",
        displayName: "Azure App Service",
        iconUri:
          "https://conn-afd-prod-endpoint-bmc9bqahasf3grgk.b01.azurefd.net/releases/v1.0.1679/1.0.1679.3643/azureappservice/icon.png",
        id: "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/providers/Microsoft.Web/locations/australiaeast/managedApis/azureappservice",
        name: "azureappservice",
        type: "Microsoft.Web/locations/managedApis",
      },
      changedTime: "2025-10-19T09:23:03.3936928Z",
      createdTime: "2025-10-17T11:07:09.0820219Z",
      displayName: "d-shp-apicn-esposter-auea-001",
      statuses: [
        {
          status: "Ready",
        },
      ],
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
