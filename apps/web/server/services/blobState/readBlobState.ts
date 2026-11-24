import type { R2Bucket } from "@cloudflare/workers-types";

import { decompressJsonBlob } from "@esposter/db";

// A blob's ETag and its stored JSON come from one download.
// The ETag and the body come off the same response, so the ETag is the one that body was stored under.
// A conditional write over it is refused once a later write replaces the body.
// A blob that is not there has neither.
interface BlobStateRead {
  etag?: string;
  json?: Buffer;
}

export const readBlobState = async (bucket: R2Bucket, blobName: string): Promise<BlobStateRead> => {
  const object = await bucket.get(blobName);
  if (!object) return {};
  const compressedJson = Buffer.from(await object.arrayBuffer());
  return { etag: object.etag, json: await decompressJsonBlob(compressedJson) };
};
