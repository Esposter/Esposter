import type { AzureContainer } from "#shared/models/azure/container/AzureContainer";

import { AzureContainerPropertiesMap } from "@@/server/models/azure/container/AzureContainerPropertiesMap";
import { syncProperties } from "@@/server/services/azure/container/syncProperties";
import { BlobServiceClient } from "@azure/storage-blob";

export const useContainerClient = async (azureContainer: AzureContainer) => {
  const runtimeConfig = useRuntimeConfig();
  const blobServiceClient = BlobServiceClient.fromConnectionString(runtimeConfig.azure.storageAccountConnectionString);
  const containerClient = blobServiceClient.getContainerClient(azureContainer);
  const containerCreateOptions = AzureContainerPropertiesMap[azureContainer];
  await containerClient.createIfNotExists(containerCreateOptions);
  await syncProperties(containerClient, containerCreateOptions);
  return containerClient;
};
