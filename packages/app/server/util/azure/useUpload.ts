import type { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import type { HttpRequestBody } from "@azure/storage-blob";

import { useContainerClient } from "@@/server/util/azure/useContainerClient";

export const useUpload = async (
  azureContainer: AzureContainer,
  blobName: string,
  data: NonNullable<HttpRequestBody>,
) => {
  const containerClient = await useContainerClient(azureContainer);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  return blockBlobClient.upload(data, data.toString().length);
};
