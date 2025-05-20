import type { ContainerClient } from "@azure/storage-blob";

export const cloneBlobUrls = async (
  containerClient: ContainerClient,
  blobUrls: string[],
  destinationPrefix: string,
) => {
  if (blobUrls.length === 0) return;
  else
    return Promise.all(
      blobUrls.map(async (blobUrl) => {
        const destinationBlobPath = blobUrl.substring(`${containerClient.url}/`.length);
        const destinationBlobName = `${destinationPrefix}/${destinationBlobPath}`;
        const destinationBlockBlobClient = containerClient.getBlockBlobClient(destinationBlobName);
        const poller = await destinationBlockBlobClient.beginCopyFromURL(blobUrl);
        await poller.pollUntilDone();
      }),
    );
};
