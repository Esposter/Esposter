import type { BlobRequestConditions } from "@azure/storage-blob";

import { checkIsAlreadyStored } from "@esposter/db";
import { getResultAsync } from "@esposter/shared";

// Resolves to whether this call wrote the blob, the upload given the condition a create-only write carries. A create-only
// Write that finds the blob already there is not an error: the same bytes under the same name are the state being asked
// For, so it resolves false
export const storeBlob = (
  upload: (conditions?: BlobRequestConditions) => Promise<unknown>,
  isCreateOnly: boolean,
): Promise<boolean> =>
  getResultAsync(() => upload(isCreateOnly ? { ifNoneMatch: "*" } : undefined)).match(
    () => true,
    (error) => {
      if (isCreateOnly && checkIsAlreadyStored(error)) return false;
      throw error;
    },
  );
