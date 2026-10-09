import type { ContainerClient } from "@azure/storage-blob";

import { checkIsNotFound, decompressJsonBlob } from "@esposter/db";
import { getResultAsync } from "@esposter/shared";

// A blob's ETag and its stored JSON, from one download: the ETag and the body come off the same response, so the ETag is
// The one that body was stored under, and a conditional write over it is refused once a later write replaces the body.
// A blob that is not there has neither
export interface BlobStateRead {
  etag?: string;
  json?: Buffer;
}

export const readBlobState = async (containerClient: ContainerClient, blobName: string): Promise<BlobStateRead> => {
  const downloaded = await getResultAsync(() => containerClient.getBlockBlobClient(blobName).download()).match(
    (response) => response,
    (error) => {
      if (checkIsNotFound(error)) return undefined;
      throw error;
    },
  );
  if (!downloaded?.readableStreamBody) return {};
  const compressedJson = Buffer.concat(
    (await Array.fromAsync(downloaded.readableStreamBody)).map((chunk) => Buffer.from(chunk)),
  );
  return { etag: downloaded.etag, json: await decompressJsonBlob(compressedJson) };
};
