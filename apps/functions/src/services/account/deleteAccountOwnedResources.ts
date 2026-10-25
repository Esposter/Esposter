import type { InvocationContext } from "@azure/functions";
import type { UserInAuth } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { purgeResourceAndBroadcast } from "#src/services/resource/purgeResourceAndBroadcast";
import { db } from "#src/services/shared/db";
import { AzureContainer, resourcesInResource } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// Each resource the account owns goes through the purge the recycle bin's timer runs for an expired one, so its
// Directory, the partitions its type owns and its ledger rows go in the order that makes a replay safe
export const deleteAccountOwnedResources = async (
  context: InvocationContext,
  userId: UserInAuth["id"],
): Promise<void> => {
  const ownedResources = await db.select().from(resourcesInResource).where(eq(resourcesInResource.userId, userId));
  const containerClient = await getContainerClient(AzureContainer.ResourceAssets);
  for (const ownedResource of ownedResources)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one resource at a time, as the timer's purge runs
    await purgeResourceAndBroadcast(context, containerClient, ownedResource);
};
