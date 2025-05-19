import type { ContainerClient } from "@azure/storage-blob";

import { AZURE_MAX_PAGE_SIZE } from "@@/server/services/azure/table/constants";

export const deleteDirectory = async (containerClient: ContainerClient, prefix = "", isDeep?: true) => {
  const blobUrls: string[] = [];

  if (isDeep)
    for await (const { segment } of containerClient
      .listBlobsFlat({ prefix })
      .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
      blobUrls.push(...segment.blobItems.map(({ name }) => `${containerClient.url}/${name}`));
  else
    for await (const { segment } of containerClient
      .listBlobsByHierarchy("/", { prefix })
      .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
      blobUrls.push(...segment.blobItems.map(({ name }) => `${containerClient.url}/${name}`));

  if (blobUrls.length === 0) return;

  const blobBatchClient = containerClient.getBlobBatchClient();
  await blobBatchClient.deleteBlobs(blobUrls, containerClient.credential);
};
