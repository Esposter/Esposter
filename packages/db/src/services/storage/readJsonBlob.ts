import type { R2Bucket } from "@cloudflare/workers-types";

import { decompressJsonBlob } from "#src/services/storage/decompressJsonBlob";

// A JSON document as the bytes it was serialized to, decompressed from the frame writeJsonBlob stored. A missing object
// Reads as undefined — nothing saved yet — and every other failure surfaces rather than passing for an empty document
export const readJsonBlob = async (bucket: R2Bucket, blobName: string): Promise<Buffer | undefined> => {
  const object = await bucket.get(blobName);
  if (!object) return undefined;
  return decompressJsonBlob(Buffer.from(await object.arrayBuffer()));
};
