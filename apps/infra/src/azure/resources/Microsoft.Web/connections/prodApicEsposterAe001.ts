import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAppServiceApiReference from "#src/azure/constants/AzureAppServiceApiReference";
import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const connectionName = "prod-apic-esposter-ae-001";

export const prodApicEsposterAe001: azure_native.web.Connection = new azure_native.web.Connection(
  connectionName,
  {
    connectionName,
    location: AzureAustraliaEastLocation,
    properties: {
      api: AzureAppServiceApiReference,
      displayName: connectionName,
    },
    resourceGroupName: prodRgEsposterAe001.name,
    tags: {
      ...ApplicationTags,
    },
  },
  {
    parent: prodRgEsposterAe001,
    protect: true,
  },
);
