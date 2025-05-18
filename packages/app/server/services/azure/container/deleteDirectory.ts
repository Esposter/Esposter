import type { ContainerClient } from "@azure/storage-blob";

import { AZURE_MAX_PAGE_SIZE } from "@@/server/services/azure/table/constants";

export const deleteDirectory = async (containerClient: ContainerClient, prefix = "") => {
  const blobBatchClient = containerClient.getBlobBatchClient();
  const blobUrls: string[] = [];

  for await (const { segment } of containerClient
    .listBlobsFlat({ prefix })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    blobUrls.push(...segment.blobItems.map(({ name }) => `${containerClient.url}/${name}`));
  if (blobUrls.length === 0) return;

  await blobBatchClient.deleteBlobs(blobUrls, containerClient.credential);
};
