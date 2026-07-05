import type { ContainerClient } from "@azure/storage-blob";
import type { FileEntity } from "@esposter/db-schema";

import { copyBlob } from "@/services/azure/container/copyBlob";
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
        const newId: string = crypto.randomUUID();
        const destinationBlobName = getBlobName(`${destinationPrefix}/${newId}`, filename);
        await copyBlob(containerClient, `${containerClient.url}/${sourceBlobName}`, destinationBlobName);
        return newId;
      }),
    );
};
