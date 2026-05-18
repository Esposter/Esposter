import ApplicationTags from "@/constants/ApplicationTags";
import AzureAppServiceManagedApiId from "@/constants/AzureAppServiceManagedApiId";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import AzureManagedApiType from "@/constants/AzureManagedApiType";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const prodApicnEsposterAuea002: azure_native.web.Connection = new azure_native.web.Connection(
  "prod-apicn-esposter-auea-002",
  {
    connectionName: "prod-apicn-esposter-auea-002",
    location: AzureAustraliaEastLocation,
    properties: {
      api: {
        brandColor: "#FFFFFF",
        description:
          "Azure App Service connector allows you to manage app services and server farms in your subscription.",
        displayName: "Azure App Service",
        iconUri:
          "https://conn-afd-prod-endpoint-bmc9bqahasf3grgk.b01.azurefd.net/releases/v1.0.1679/1.0.1679.3643/azureappservice/icon.png",
        id: AzureAppServiceManagedApiId,
        name: "azureappservice",
        type: AzureManagedApiType,
      },
      displayName: "prod-apicn-esposter-auea-002",
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
