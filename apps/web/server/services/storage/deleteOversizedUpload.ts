import type { StorageBucket } from "@esposter/db-schema";

import { getBucket } from "#server/services/storage/getBucket";
import { getResultAsync, noop } from "@esposter/shared";

// A presigned PUT bounds nothing sent through it, so the size a client declared is only an early no: the object's real
// Size is the one the cap holds. An object over the cap is deleted, so no later save can name it, and the caller
// Refuses the save. A missing object is left to the caller, since a save may name a blob the row already holds
export const deleteOversizedUpload = async (
  storageBucket: StorageBucket,
  blobName: string,
  maxSizeBytes: number,
): Promise<boolean> => {
  const bucket = getBucket(storageBucket);
  const uploadedObject = await bucket.head(blobName);
  if (!uploadedObject || uploadedObject.size <= maxSizeBytes) return false;

  // Best-effort: a failed delete leaves the object behind, and the refusal stands either way
  await getResultAsync(() => bucket.delete(blobName)).match(noop, console.error);
  return true;
};
