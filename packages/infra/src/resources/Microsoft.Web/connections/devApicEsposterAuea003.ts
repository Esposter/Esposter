import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import AzureManagedApiType from "@/constants/AzureManagedApiType";
import AzureResourceManagerManagedApiId from "@/constants/AzureResourceManagerManagedApiId";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

const connectionName = "dev-apic-esposter-auea-003";

export const devApicEsposterAuea003: azure_native.web.Connection = new azure_native.web.Connection(
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
    resourceGroupName: dShpRgEsposterAuea001.name,
    tags: {
      ...ApplicationTags,
    },
  },
  {
    parent: dShpRgEsposterAuea001,
    protect: true,
  },
);
