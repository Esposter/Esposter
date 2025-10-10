import type { AzureContainer } from "@/models/azure/container/AzureContainer";

import { AzureContainerPropertiesMap } from "@/models/azure/container/AzureContainerPropertiesMap";
import { syncProperties } from "@/services/azure/container/syncProperties";
import { BlobServiceClient } from "@azure/storage-blob";

export const getContainerClient = async (connectionString: string, azureContainer: AzureContainer) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(azureContainer);
  const containerCreateOptions = AzureContainerPropertiesMap[azureContainer];
  await containerClient.createIfNotExists(containerCreateOptions);
  await syncProperties(containerClient, containerCreateOptions);
  return containerClient;
};
