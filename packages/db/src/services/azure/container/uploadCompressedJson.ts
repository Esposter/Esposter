import type { BlobRequestConditions, ContainerClient } from "@azure/storage-blob";

// Uploads a frame from compressJson as a JSON blob. A conditional write is refused when the blob has moved on from the
// Etag or the absence the condition names, which is how a concurrent writer is told so. `cacheControl` is set only for a
// Blob addressed by its content, which never changes and so may be cached for good
export const uploadCompressedJson = async (
  containerClient: ContainerClient,
  blobName: string,
  compressedJson: Buffer,
  { cacheControl, conditions }: { cacheControl?: string; conditions?: BlobRequestConditions } = {},
): Promise<{ etag?: string; size: number }> => {
  const { etag } = await containerClient
    .getBlockBlobClient(blobName)
    .upload(compressedJson, compressedJson.byteLength, {
      blobHTTPHeaders: {
        blobCacheControl: cacheControl,
        blobContentEncoding: "zstd",
        blobContentType: "application/json",
      },
      conditions,
    });
  return { etag, size: compressedJson.byteLength };
};
