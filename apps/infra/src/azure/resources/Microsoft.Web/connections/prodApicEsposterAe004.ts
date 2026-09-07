import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import AzureResourceManagerApiReference from "#src/azure/constants/AzureResourceManagerApiReference";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const connectionName = "prod-apic-esposter-ae-004";

export const prodApicEsposterAe004: azure_native.web.Connection = new azure_native.web.Connection(
  connectionName,
  {
    connectionName,
    location: AzureAustraliaEastLocation,
    properties: {
      api: AzureResourceManagerApiReference,
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
