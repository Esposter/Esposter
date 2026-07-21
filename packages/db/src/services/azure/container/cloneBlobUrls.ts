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
        // The urls arrive percent-encoded as the content carries them — a blob NAME is the decoded form,
        // While the copy source stays the encoded url the service has to fetch
        const destinationBlobPath = decodeURIComponent(blobUrl.slice(`${containerClient.url}/${sourcePrefix}/`.length));
        return copyBlob(containerClient, blobUrl, `${destinationPrefix}/${destinationBlobPath}`);
      }),
    );
};
