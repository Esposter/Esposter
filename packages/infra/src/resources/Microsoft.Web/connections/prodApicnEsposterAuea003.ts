import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import AzureManagedApiType from "@/constants/AzureManagedApiType";
import AzureResourceManagerManagedApiId from "@/constants/AzureResourceManagerManagedApiId";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const prodApicnEsposterAuea003: azure_native.web.Connection = new azure_native.web.Connection(
  "prod-apicn-esposter-auea-003",
  {
    connectionName: "prod-apicn-esposter-auea-003",
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
      displayName: "prod-apicn-esposter-auea-003",
    },
    resourceGroupName: pShpRgEsposterAuea001.name,
    tags: {
      ...ApplicationTags,
    },
  },
  {
    protect: true,
  },
);
