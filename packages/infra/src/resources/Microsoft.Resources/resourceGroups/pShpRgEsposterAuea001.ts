import PShpRgEsposterAuea001Name from "@/constants/PShpRgEsposterAuea001Name";
import * as azure_native from "@pulumi/azure-native";

export const pShpRgEsposterAuea001: azure_native.resources.ResourceGroup = new azure_native.resources.ResourceGroup(
  PShpRgEsposterAuea001Name,
  {
    location: "australiaeast",
    resourceGroupName: PShpRgEsposterAuea001Name,
    tags: {
      Application: "Esposter",
    },
  },
  {
    protect: true,
  },
);
