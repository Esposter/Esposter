import type { R2Bucket } from "@cloudflare/workers-types";
import type { ResourceInResource } from "@esposter/db-schema";

import { getDb } from "#src/services/shared/getDb";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { purgeResource } from "@esposter/db";

// One resource's purge, then the broadcast to the owners it gave bytes back to. The recycle bin's timer and the account
// Deletion each call it once per resource. The owner's resource list is not published here: the purge's delete names the
// Row's owner scope, and the unit it runs in publishes that when it settles
export const purgeResourceAndBroadcast = async (
  bucket: R2Bucket,
  { id }: Pick<ResourceInResource, "id">,
): Promise<void> => {
  const releasedUserIds = await purgeResource(getDb(), bucket, id);
  await broadcastStorageUsage(releasedUserIds);
};
