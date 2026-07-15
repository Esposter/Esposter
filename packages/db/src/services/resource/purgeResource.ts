import type { ContainerClient } from "@azure/storage-blob";
import type { CustomTableClient, relations, Resource, ResourceActivityEntity } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { deleteDirectory } from "@/services/azure/container/deleteDirectory";
import { deleteResourceActivities } from "@/services/resource/deleteResourceActivities";
import { resources } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// Ordered for idempotent retry: blob directory, then dependent Azure Table partitions, then the
// Postgres row LAST. A partial failure leaves the row behind as the durable marker that re-drives
// The whole sequence; blob and table deletes treat already-gone as success, so replaying is safe.
export const purgeResource = async (
  db: PostgresJsDatabase<typeof relations>,
  containerClient: ContainerClient,
  resourceActivityClient: CustomTableClient<ResourceActivityEntity>,
  resourceId: Resource["id"],
) => {
  await deleteDirectory(containerClient, resourceId, true);
  await deleteResourceActivities(resourceActivityClient, resourceId);
  await db.delete(resources).where(eq(resources.id, resourceId));
};
