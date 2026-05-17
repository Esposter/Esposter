import * as azure_native from "@pulumi/azure-native";

export const pShpRgEsposterAuea001: azure_native.resources.ResourceGroup = new azure_native.resources.ResourceGroup(
  "p-shp-rg-esposter-auea-001",
  {
    location: "australiaeast",
    resourceGroupName: "p-shp-rg-esposter-auea-001",
    tags: {
      Application: "Esposter",
    },
  },
  {
    protect: true,
  },
);
