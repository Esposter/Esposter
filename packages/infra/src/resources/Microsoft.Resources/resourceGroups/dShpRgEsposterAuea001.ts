import DShpRgEsposterAuea001Name from "@/constants/DShpRgEsposterAuea001Name";
import * as azure_native from "@pulumi/azure-native";

export const dShpRgEsposterAuea001: azure_native.resources.ResourceGroup = new azure_native.resources.ResourceGroup(
  DShpRgEsposterAuea001Name,
  {
    location: "australiaeast",
    resourceGroupName: DShpRgEsposterAuea001Name,
    tags: {
      Application: "Esposter",
    },
  },
  {
    protect: true,
  },
);
