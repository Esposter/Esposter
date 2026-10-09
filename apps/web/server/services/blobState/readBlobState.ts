import type { ContainerClient } from "@azure/storage-blob";

import { checkIsNotFound, readJsonBlob } from "@esposter/db";
import { getResultAsync } from "@esposter/shared";

// A blob's ETag and its stored JSON, read together. The ETag's request is answered before the JSON's is sent, so a
// Write that lands between them leaves the ETag older than the JSON, and the next conditional write over it is refused
// Rather than passing unseen. Overlapping the two would let the JSON be the older and the write pass. A blob that is
// Not there has neither
export interface BlobStateRead {
  etag: string | undefined;
  json: Buffer | undefined;
}

export const readBlobState = async (containerClient: ContainerClient, blobName: string): Promise<BlobStateRead> => {
  const etag = await getResultAsync(() => containerClient.getBlockBlobClient(blobName).getProperties()).match(
    (properties) => properties.etag,
    (error) => {
      if (checkIsNotFound(error)) return undefined;
      throw error;
    },
  );
  const json = await readJsonBlob(containerClient, blobName);
  return { etag, json };
};
