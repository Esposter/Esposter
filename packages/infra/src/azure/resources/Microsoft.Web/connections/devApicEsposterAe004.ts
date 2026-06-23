import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import AzureManagedApiType from "@/azure/constants/AzureManagedApiType";
import AzureResourceManagerManagedApiId from "@/azure/constants/AzureResourceManagerManagedApiId";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const connectionName = "dev-apic-esposter-ae-004";

export const devApicEsposterAe004: azure_native.web.Connection = new azure_native.web.Connection(
  connectionName,
  {
    connectionName,
    location: AzureAustraliaEastLocation,
    properties: {
      api: {
        brandColor: "",
        description: "Azure Resource Manager exposes the APIs to manage all of your Azure resources.",
        displayName: "Azure Resource Manager",
        iconUri: "https://conn-afd-prod-endpoint-bmc9bqahasf3grgk.b01.azurefd.net/v1.0.1751/1.0.1751.4207/arm/icon.png",
        id: AzureResourceManagerManagedApiId,
        name: "arm",
        type: AzureManagedApiType,
      },
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
