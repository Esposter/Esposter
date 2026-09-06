import AzureManagedApiType from "#src/azure/constants/AzureManagedApiType";
import AzureResourceManagerManagedApiId from "#src/azure/constants/AzureResourceManagerManagedApiId";
import * as azure_native from "@pulumi/azure-native";

// The managed API every Resource Manager connection points at. The block is the connector's own published
// Metadata, so it is identical in both stacks — only the connection's name and resource group differ.
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
