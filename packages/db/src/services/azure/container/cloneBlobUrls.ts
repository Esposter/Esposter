import type { ContainerClient } from "@azure/storage-blob";

import { copyBlob } from "@/services/azure/container/copyBlob";

export const cloneBlobUrls = (
  containerClient: ContainerClient,
  blobUrls: string[],
  sourcePrefix: string,
  destinationPrefix: string,
) => {
  if (blobUrls.length === 0) return undefined;
  else
    return Promise.all(
      blobUrls.map((blobUrl) => {
        const destinationBlobPath = blobUrl.slice(`${containerClient.url}/${sourcePrefix}/`.length);
        return copyBlob(containerClient, blobUrl, `${destinationPrefix}/${destinationBlobPath}`);
      }),
    );
};
