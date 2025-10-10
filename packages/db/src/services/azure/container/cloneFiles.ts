import type { FileEntity } from "@/models/azure/table/FileEntity";
import type { ContainerClient } from "@azure/storage-blob";

import { getBlobName } from "@/services/azure/container/getBlobName";

export const cloneFiles = (
  containerClient: ContainerClient,
  files: FileEntity[],
  sourcePrefix = "",
  destinationPrefix = sourcePrefix,
) => {
  if (files.length === 0) return [];
  else
    return Promise.all(
      files.map(async ({ filename, id }) => {
        const sourceBlobName = getBlobName(`${sourcePrefix}/${id}`, filename);
        const sourceBlobUrl = `${containerClient.url}/${sourceBlobName}`;
        const newId: string = crypto.randomUUID();
        const destinationBlobName = getBlobName(`${destinationPrefix}/${newId}`, filename);
        const destinationBlockBlobClient = containerClient.getBlockBlobClient(destinationBlobName);
        const poller = await destinationBlockBlobClient.beginCopyFromURL(sourceBlobUrl);
        await poller.pollUntilDone();
        return newId;
      }),
    );
};
