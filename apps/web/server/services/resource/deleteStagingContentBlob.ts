import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { getStagingContentBlobName } from "#server/services/resource/getStagingContentBlobName";
import { emitStorageUsage } from "#server/services/storage/emitStorageUsage";
import { getBucket } from "#server/services/storage/getBucket";
import { deleteStorageBlobs } from "@esposter/db";
import { StorageBucket } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// A committed staged save leaves its upload behind, and the deletion path is what gives its bytes back, so the
// Owner is charged for the content blob alone. Best-effort: the save has already landed, and a blob left here is
// Overwritten by the next large save or taken by purge with the rest of the directory
export const deleteStagingContentBlob = async (db: Context["db"], id: ResourceInResource["id"]): Promise<void> => {
  const bucket = getBucket(StorageBucket.ResourceAssets);
  await getResultAsync(() =>
    deleteStorageBlobs(db, bucket, StorageBucket.ResourceAssets, [getStagingContentBlobName(id)], async (userIds) => {
      await Promise.all(userIds.map((userId) => emitStorageUsage(db, userId)));
    }),
  ).match(noop, console.error);
};
