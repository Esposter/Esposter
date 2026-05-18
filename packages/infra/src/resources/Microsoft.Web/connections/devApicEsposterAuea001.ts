import ApplicationTags from "@/constants/ApplicationTags";
import AzureAppServiceManagedApiId from "@/constants/AzureAppServiceManagedApiId";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import AzureManagedApiType from "@/constants/AzureManagedApiType";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

const connectionName = "dev-apic-esposter-auea-001";

export const devApicEsposterAuea001: azure_native.web.Connection = new azure_native.web.Connection(
  connectionName,
  {
    connectionName,
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
