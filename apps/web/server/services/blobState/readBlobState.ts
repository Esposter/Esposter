import type { ContainerClient } from "@azure/storage-blob";

import { checkIsNotFound, readJsonBlob } from "@esposter/db";
import { getResultAsync } from "@esposter/shared";

// A blob's ETag and its stored JSON, read together. The ETag is requested first, so a write that lands while the JSON is
// Read leaves the ETag older than the JSON, and the next conditional write over it is refused rather than passing unseen.
// A blob that is not there has neither
export interface BlobStateRead {
  etag: string | undefined;
  json: Buffer | undefined;
}

export const readBlobState = async (containerClient: ContainerClient, blobName: string): Promise<BlobStateRead> => {
  const [etag, json] = await Promise.all([
    getResultAsync(() => containerClient.getBlockBlobClient(blobName).getProperties()).match(
      (properties) => properties.etag,
      (error) => {
        if (checkIsNotFound(error)) return undefined;
        throw error;
      },
    ),
    readJsonBlob(containerClient, blobName),
  ]);
  return { etag, json };
};
