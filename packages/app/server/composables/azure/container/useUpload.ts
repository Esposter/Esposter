import type { HttpRequestBody } from "@azure/storage-blob";
import type { AzureContainer } from "@esposter/db-schema";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { lookup } from "mime-types";

export const useUpload = async (
  azureContainer: AzureContainer,
  blobName: string,
  data: NonNullable<HttpRequestBody>,
) => {
  const containerClient = await useContainerClient(azureContainer);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  return blockBlobClient.upload(data, data.toString().length, {
    blobHTTPHeaders: { blobContentType: lookup(blobName) || undefined },
  });
};
