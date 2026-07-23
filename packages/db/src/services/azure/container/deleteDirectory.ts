import type { ContainerClient } from "@azure/storage-blob";

import { listBlobNames } from "@/services/azure/container/listBlobNames";

export const deleteDirectory = async (containerClient: ContainerClient, prefix = "", isDeep?: true) => {
  const blobUrls = (await listBlobNames(containerClient, prefix, { isDeep })).map(
    (name) => `${containerClient.url}/${name}`,
  );
  if (blobUrls.length === 0) return;

  const blobBatchClient = containerClient.getBlobBatchClient();
  await blobBatchClient.deleteBlobs(blobUrls, containerClient.credential);
};
