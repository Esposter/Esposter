import type { R2Bucket } from "@cloudflare/workers-types";

import { hashBlobStream } from "#src/services/storage/hashBlobStream";

// A resource asset is addressed by the hash of its bytes, and the client computes that hash and uploads directly, so no
// Name is trusted until the bytes stored under it are read back and hashed. Answers the hash of bytes that do not
// Describe the name, after removing them, and undefined when they do or nothing is stored. R2 cannot condition a delete
// On the etag that was hashed, so the removal is unconditional: a valid upload that took the name after the read goes
// With it. The bytes such an upload carries are the name's own, so the only loss is one re-upload by a client that
// Raced a bad one
export const findMismatchedResourceAssetHash = async (
  bucket: R2Bucket,
  blobName: string,
  expectedHash: string,
): Promise<string | undefined> => {
  const object = await bucket.get(blobName);
  if (!object) return undefined;

  const actualHash = await hashBlobStream(object.body);
  if (actualHash === expectedHash) return undefined;

  await bucket.delete(blobName);
  return actualHash;
};
