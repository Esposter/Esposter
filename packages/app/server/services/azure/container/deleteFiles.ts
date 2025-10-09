import type { ContainerClient } from "@azure/storage-blob";
import type { FileEntity } from "@esposter/shared";

import { getBlobName } from "@@/server/services/azure/container/getBlobName";

export const deleteFiles = async (containerClient: ContainerClient, files: FileEntity[], prefix = "") => {
  if (files.length === 0) return;

  const blobBatchClient = containerClient.getBlobBatchClient();
  const blobUrls = files.map(({ filename, id }) => {
    const blobName = getBlobName(`${prefix}/${id}`, filename);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.url;
  });
  await blobBatchClient.deleteBlobs(blobUrls, containerClient.credential);
};
