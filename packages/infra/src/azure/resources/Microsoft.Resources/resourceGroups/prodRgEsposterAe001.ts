import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import * as azure_native from "@pulumi/azure-native";

const resourceGroupName = "prod-rg-esposter-ae-001";

export const prodRgEsposterAe001: azure_native.resources.ResourceGroup = new azure_native.resources.ResourceGroup(
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
