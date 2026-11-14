import type { R2Bucket } from "@cloudflare/workers-types";

import { InvalidOperationError, Operation } from "@esposter/shared";

// R2 has no server-side copy, so the object's body streams from one key into the other through the Worker. The source
// Has to exist: a copy of nothing is a caller's mistake, not an empty object
export const copyBlob = async (
  bucket: R2Bucket,
  sourceBlobName: string,
  destinationBlobName: string,
): Promise<void> => {
  const sourceObject = await bucket.get(sourceBlobName);
  if (!sourceObject) throw new InvalidOperationError(Operation.Read, sourceBlobName, "is not in the bucket to copy");

  await bucket.put(destinationBlobName, sourceObject.body, { httpMetadata: sourceObject.httpMetadata });
};
