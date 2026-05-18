import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import PShpRgEsposterAuea001Name from "@/constants/PShpRgEsposterAuea001Name";
import * as azure_native from "@pulumi/azure-native";

export const pShpRgEsposterAuea001: azure_native.resources.ResourceGroup = new azure_native.resources.ResourceGroup(
  PShpRgEsposterAuea001Name,
  {
    location: AzureAustraliaEastLocation,
    resourceGroupName: PShpRgEsposterAuea001Name,
    tags: {
      ...ApplicationTags,
    },
  },
  {
    protect: true,
  },
);
