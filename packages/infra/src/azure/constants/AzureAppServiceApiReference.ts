import AzureAppServiceManagedApiId from "#src/azure/constants/AzureAppServiceManagedApiId";
import AzureManagedApiType from "#src/azure/constants/AzureManagedApiType";
import * as azure_native from "@pulumi/azure-native";

// The managed API every App Service connection points at. The block is the connector's own published
// Metadata, so it is identical in both stacks — only the connection's name and resource group differ.
const AzureAppServiceApiReference: azure_native.types.input.web.ApiReferenceArgs = {
  brandColor: "#FFFFFF",
  description: "Azure App Service connector allows you to manage app services and server farms in your subscription.",
  displayName: "Azure App Service",
  iconUri:
    "https://conn-afd-prod-endpoint-bmc9bqahasf3grgk.b01.azurefd.net/releases/v1.0.1679/1.0.1679.3643/azureappservice/icon.png",
  id: AzureAppServiceManagedApiId,
  name: "azureappservice",
  type: AzureManagedApiType,
};

export default AzureAppServiceApiReference;
