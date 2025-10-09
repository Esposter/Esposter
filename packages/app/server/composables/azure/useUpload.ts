import type { AzureContainer } from "#shared/models/azure/container/AzureContainer";
import type { HttpRequestBody } from "@azure/storage-blob";

import { useContainerClient } from "@@/server/composables/azure/useContainerClient";

export const useUpload = async (
  azureContainer: AzureContainer,
  blobName: string,
  data: NonNullable<HttpRequestBody>,
) => {
  const containerClient = await useContainerClient(azureContainer);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  return blockBlobClient.upload(data, data.toString().length);
};
