import type { R2Bucket } from "@cloudflare/workers-types";
import type { ResourceInResource } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { purgeResource } from "@esposter/db";

// One resource's purge, then the broadcast to the owners it gave bytes back to. The recycle bin's timer and the account
// Deletion each call it once per resource
export const purgeResourceAndBroadcast = async (
  bucket: R2Bucket,
  { id }: Pick<ResourceInResource, "id">,
): Promise<void> => {
  const releasedUserIds = await purgeResource(db, bucket, id);
  await broadcastStorageUsage(releasedUserIds);
};
