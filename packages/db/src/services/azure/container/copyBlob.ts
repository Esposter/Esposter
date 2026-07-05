import type { ContainerClient } from "@azure/storage-blob";

export const copyBlob = async (
  containerClient: ContainerClient,
  sourceBlobUrl: string,
  destinationBlobName: string,
): Promise<void> => {
  const destinationBlockBlobClient = containerClient.getBlockBlobClient(destinationBlobName);
  const poller = await destinationBlockBlobClient.beginCopyFromURL(sourceBlobUrl);
  await poller.pollUntilDone();
};
