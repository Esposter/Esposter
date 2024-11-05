import type { AzureContainer } from "@/shared/models/azure/blob/AzureContainer";

import { BlobServiceClient } from "@azure/storage-blob";

export const useContainerClient = async (containerName: AzureContainer) => {
  const runtimeConfig = useRuntimeConfig();
  const blobServiceClient = BlobServiceClient.fromConnectionString(runtimeConfig.azure.storageAccountConnectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  return containerClient;
};
