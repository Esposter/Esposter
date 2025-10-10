import type { AzureContainer } from "@esposter/db-schema";

import { useContainerClient } from "@@/server/composables/azure/useContainerClient";

export const useDownload = async (azureContainer: AzureContainer, blobName: string) => {
  const containerClient = await useContainerClient(azureContainer);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  return blockBlobClient.download();
};
