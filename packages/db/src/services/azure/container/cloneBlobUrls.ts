import type { ContainerClient } from "@azure/storage-blob";

import { copyBlob } from "@/services/azure/container/copyBlob";
import { getBlobNameFromUrl } from "@/services/azure/container/getBlobNameFromUrl";

export const cloneBlobUrls = (
  containerClient: ContainerClient,
  blobUrls: string[],
  sourcePrefix: string,
  destinationPrefix: string,
) => {
  if (blobUrls.length === 0) return undefined;
  else
    return Promise.all(
      // The urls arrive percent-encoded as the content carries them — a blob NAME is the decoded form,
      // While the copy source stays the encoded url the service has to fetch. A url that decodes to nothing
      // Names no destination, so it is skipped rather than failing the clone of every other asset
      blobUrls.flatMap((blobUrl) => {
        const destinationBlobPath = getBlobNameFromUrl(blobUrl, `${containerClient.url}/${sourcePrefix}/`);
        if (destinationBlobPath === undefined) return [];
        else return [copyBlob(containerClient, blobUrl, `${destinationPrefix}/${destinationBlobPath}`)];
      }),
    );
};
