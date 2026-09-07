import AzureAppServiceManagedApiId from "#src/azure/constants/AzureAppServiceManagedApiId";
import AzureManagedApiType from "#src/azure/constants/AzureManagedApiType";
import * as azure_native from "@pulumi/azure-native";

const AzureAppServiceApiReference: azure_native.types.input.web.ApiReferenceArgs = {
  brandColor: "#FFFFFF",
  description: "Azure App Service connector allows you to manage app services and server farms in your subscription.",
  displayName: "Azure App Service",
  iconUri: "https://static.powerapps.com/resource/ppcr/releases/v1.0.1827/1.0.1827.4902/azureappservice/icon.png",
  id: AzureAppServiceManagedApiId,
  name: "azureappservice",
  type: AzureManagedApiType,
};

export default AzureAppServiceApiReference;
