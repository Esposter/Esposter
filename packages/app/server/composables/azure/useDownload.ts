import type { AzureContainer } from "#shared/models/azure/container/AzureContainer";

import { useContainerClient } from "@@/server/composables/azure/useContainerClient";

export const useDownload = async (azureContainer: AzureContainer, blobName: string) => {
  const containerClient = await useContainerClient(azureContainer);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  return blockBlobClient.download();
};
