import type { AzureContainer } from "@esposter/db-schema";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { lookup } from "mime-types";

export const useUpload = async (azureContainer: AzureContainer, blobName: string, data: string) => {
  const containerClient = await useContainerClient(azureContainer);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  // The content length is the byte length, not the character count: a string with any non-ASCII character
  // Encodes to more bytes than it has characters, and the shorter count truncates the uploaded blob
  return blockBlobClient.upload(data, Buffer.byteLength(data), {
    blobHTTPHeaders: { blobContentType: lookup(blobName) || undefined },
  });
};
