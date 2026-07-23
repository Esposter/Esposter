import type { ContainerClient } from "@azure/storage-blob";

import { copyBlob } from "@/services/azure/container/copyBlob";
import { listBlobNames } from "@/services/azure/container/listBlobNames";

export const cloneDirectory = async (
  containerClient: ContainerClient,
  sourcePrefix: string,
  destinationPrefix: string,
  isDeep?: true,
) => {
  const sourceBlobNames = await listBlobNames(containerClient, sourcePrefix, { isDeep });
  if (sourceBlobNames.length === 0) return undefined;

  return Promise.all(
    sourceBlobNames.map((sourceBlobName) => {
      const relativeBlobName = sourceBlobName.slice(`${sourcePrefix}/`.length);
      return copyBlob(
        containerClient,
        `${containerClient.url}/${sourceBlobName}`,
        `${destinationPrefix}/${relativeBlobName}`,
      );
    }),
  );
};
