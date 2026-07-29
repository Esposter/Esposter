import type { ContainerClient } from "@azure/storage-blob";

// Takes the source blob NAME, never a url the caller built: the copy source has to be the SDK client's own
// Url so the service receives the percent-encoded form of the decoded name. `#` and `?` are legal filename
// Characters (BLOB_SEGMENT_REGEX permits them), and an interpolated url truncates at the first of either —
// Azure then fails the copy with CannotVerifyCopySource against a name that was never written.
// Same-account copies need no SAS.
export const copyBlob = async (
  containerClient: ContainerClient,
  sourceBlobName: string,
  destinationBlobName: string,
): Promise<void> => {
  const sourceBlockBlobClient = containerClient.getBlockBlobClient(sourceBlobName);
  const destinationBlockBlobClient = containerClient.getBlockBlobClient(destinationBlobName);
  const poller = await destinationBlockBlobClient.beginCopyFromURL(sourceBlockBlobClient.url);
  await poller.pollUntilDone();
};
