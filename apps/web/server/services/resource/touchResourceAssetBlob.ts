import type { R2Bucket } from "@cloudflare/workers-types";

// Moves the blob's upload time to now, restarting its grace window. R2 has no metadata-only write, so the object is
// Rewritten under its own name, which is what stamps the new upload time. Answers whether there was a blob to move: a
// Blob already gone answers false, so a caller can tell it from a touch that landed, and any other failure rethrows
export const touchResourceAssetBlob = async (bucket: R2Bucket, blobName: string): Promise<boolean> => {
  const object = await bucket.get(blobName);
  if (!object) return false;

  await bucket.put(blobName, object.body, {
    customMetadata: { touchedAt: new Date().toISOString() },
    httpMetadata: object.httpMetadata,
  });
  return true;
};
