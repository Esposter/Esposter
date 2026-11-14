import type { R2Bucket } from "@cloudflare/workers-types";
import type { ResourceInResource } from "@esposter/db-schema";

import { getStreamTableClient } from "#src/services/streams/getStreamTableClient";
import { db } from "#src/services/shared/db";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { purgeResource } from "@esposter/db";
import { getResourceOwnedTableNames } from "@esposter/db-schema";

// One resource's purge, then the broadcast to the owners it gave bytes back to. The timer's per-resource body, which the
// One-time survey purge repeats for each survey
export const purgeResourceAndBroadcast = async (
  bucket: R2Bucket,
  { id, type }: Pick<ResourceInResource, "id" | "type">,
): Promise<void> => {
  // The type decides which partitions this resource owns, so the client list is per-resource
  const tableClients = await Promise.all(
    getResourceOwnedTableNames(type).map((tableName) => getStreamTableClient(tableName)),
  );
  const releasedUserIds = await purgeResource(db, bucket, tableClients, id);
  await broadcastStorageUsage(releasedUserIds);
};
