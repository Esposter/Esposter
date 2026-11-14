import type { UserInAuth } from "@esposter/db-schema";

import { purgeResourceAndBroadcast } from "#src/services/resource/purgeResourceAndBroadcast";
import { db } from "#src/services/shared/db";
import { getBucket } from "#src/services/storage/getBucket";
import { StorageBucket, resourcesInResource } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// Each resource the account owns goes through the purge the recycle bin's timer runs for an expired one, so its
// Directory, the partitions its type owns and its ledger rows go in the order that makes a replay safe
export const deleteAccountOwnedResources = async (userId: UserInAuth["id"]): Promise<void> => {
  const ownedResources = await db
    .select({ id: resourcesInResource.id })
    .from(resourcesInResource)
    .where(eq(resourcesInResource.userId, userId));
  const bucket = getBucket(StorageBucket.ResourceAssets);
  for (const ownedResource of ownedResources)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one resource at a time, as the timer's purge runs
    await purgeResourceAndBroadcast(bucket, ownedResource);
};
