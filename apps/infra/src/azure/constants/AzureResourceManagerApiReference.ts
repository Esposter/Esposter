import AzureManagedApiType from "#src/azure/constants/AzureManagedApiType";
import AzureResourceManagerManagedApiId from "#src/azure/constants/AzureResourceManagerManagedApiId";
import * as azure_native from "@pulumi/azure-native";

const AzureResourceManagerApiReference: azure_native.types.input.web.ApiReferenceArgs = {
  brandColor: "",
  description: "Azure Resource Manager exposes the APIs to manage all of your Azure resources.",
  displayName: "Azure Resource Manager",
  iconUri: "https://conn-afd-prod-endpoint-bmc9bqahasf3grgk.b01.azurefd.net/v1.0.1751/1.0.1751.4207/arm/icon.png",
  id: AzureResourceManagerManagedApiId,
  name: "arm",
  type: AzureManagedApiType,
};

export default AzureResourceManagerApiReference;
