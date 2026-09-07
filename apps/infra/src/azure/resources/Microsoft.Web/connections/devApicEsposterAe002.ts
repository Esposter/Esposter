import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAppServiceApiReference from "#src/azure/constants/AzureAppServiceApiReference";
import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const connectionName = "dev-apic-esposter-ae-002";

export const devApicEsposterAe002: azure_native.web.Connection = new azure_native.web.Connection(
  connectionName,
  {
    connectionName,
    location: AzureAustraliaEastLocation,
    properties: {
      api: AzureAppServiceApiReference,
      displayName: connectionName,
    },
    resourceGroupName: devRgEsposterAe001.name,
    tags: {
      ...ApplicationTags,
    },
  },
  {
    parent: devRgEsposterAe001,
    protect: true,
  },
);
