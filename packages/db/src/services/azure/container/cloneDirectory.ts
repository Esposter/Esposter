import type { ContainerClient } from "@azure/storage-blob";

import { AZURE_MAX_PAGE_SIZE } from "@/services/azure/constants";

export const cloneDirectory = async (
  containerClient: ContainerClient,
  sourcePrefix: string,
  destinationPrefix: string,
  isDeep?: true,
) => {
  const sourceBlobNames: string[] = [];

  if (isDeep)
    for await (const { segment } of containerClient
      .listBlobsFlat({ prefix: sourcePrefix })
      .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
      sourceBlobNames.push(...segment.blobItems.map(({ name }) => name));
  else
    for await (const { segment } of containerClient
      .listBlobsByHierarchy("/", { prefix: sourcePrefix })
      .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
      sourceBlobNames.push(...segment.blobItems.map(({ name }) => name));

  if (sourceBlobNames.length === 0) return;

  return Promise.all(
    sourceBlobNames.map(async (sourceBlobName) => {
      const sourceBlobUrl = `${containerClient.url}/${sourceBlobName}`;
      const destinationBlobName = `${destinationPrefix}/${sourceBlobName}`;
      const destinationBlockBlobClient = containerClient.getBlockBlobClient(destinationBlobName);
      const poller = await destinationBlockBlobClient.beginCopyFromURL(sourceBlobUrl);
      await poller.pollUntilDone();
    }),
  );
};
