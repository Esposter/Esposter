import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import * as azure_native from "@pulumi/azure-native";

const resourceGroupName = "p-shp-rg-esposter-auea-001";

export const pShpRgEsposterAuea001: azure_native.resources.ResourceGroup = new azure_native.resources.ResourceGroup(
  resourceGroupName,
  {
    location: AzureAustraliaEastLocation,
    resourceGroupName,
    tags: {
      ...ApplicationTags,
    },
  },
  {
    protect: true,
  },
);
