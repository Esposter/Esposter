import type { R2Bucket } from "@cloudflare/workers-types";
import type { ResourceInResource } from "@esposter/db-schema";

import { publishTopicsBestEffort } from "#src/services/realtime/publishTopicsBestEffort";
import { getDb } from "#src/services/shared/db";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { purgeResource } from "@esposter/db";
import { getTopic, TopicKind } from "@esposter/db-schema";

// One resource's purge, then the broadcast to the owners it gave bytes back to. The recycle bin's timer and the account
// Deletion each call it once per resource. The owner's resource list is published as well, since the recycle bin reads it
export const purgeResourceAndBroadcast = async (
  bucket: R2Bucket,
  { id }: Pick<ResourceInResource, "id">,
): Promise<void> => {
  // Read before the purge removes the row that names the owner. A resource an earlier attempt already purged has none
  const resource = await getDb().query.resourcesInResource.findFirst({
    columns: { userId: true },
    where: { id: { eq: id } },
  });
  const releasedUserIds = await purgeResource(getDb(), bucket, id);
  await broadcastStorageUsage(releasedUserIds);
  if (resource)
    await publishTopicsBestEffort(
      () => [{ topic: getTopic(TopicKind.ResourceList, resource.userId) }],
      `Failed to publish the resource list of "${resource.userId}":`,
    );
};
