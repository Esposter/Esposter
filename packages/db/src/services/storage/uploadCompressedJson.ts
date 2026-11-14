import type { R2Bucket, R2Conditional, R2Object } from "@cloudflare/workers-types";

// Uploads a frame from compressZstd as a JSON object. A conditional write the object has moved on from resolves to null
// rather than throwing, so the caller's claim reads the answer directly. `cacheControl` is set only for an object addressed
// by its content, which never changes and so may be cached for good
export const uploadCompressedJson = (
  bucket: R2Bucket,
  blobName: string,
  compressedJson: Buffer,
  { cacheControl, onlyIf }: { cacheControl?: string; onlyIf?: R2Conditional } = {},
): Promise<R2Object | null> =>
  bucket.put(blobName, compressedJson, {
    httpMetadata: { cacheControl, contentEncoding: "zstd", contentType: "application/json" },
    onlyIf,
  });
