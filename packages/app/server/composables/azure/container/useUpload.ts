import type { HttpRequestBody } from "@azure/storage-blob";
import type { AzureContainer } from "@esposter/db-schema";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";

export const useUpload = async (
  azureContainer: AzureContainer,
  blobName: string,
  data: NonNullable<HttpRequestBody>,
) => {
  const containerClient = await useContainerClient(azureContainer);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  return blockBlobClient.upload(data, data.toString().length);
};
