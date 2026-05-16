import * as azure_native from "@pulumi/azure-native";

export const dShpRgEsposterAuea001: azure_native.resources.ResourceGroup = new azure_native.resources.ResourceGroup(
  "d-shp-rg-esposter-auea-001",
  {
    location: "australiaeast",
    resourceGroupName: "d-shp-rg-esposter-auea-001",
    tags: {
      Application: "Esposter",
    },
  },
  {
    protect: true,
  },
);
