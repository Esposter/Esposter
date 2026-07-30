import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { deleteDirectory, deleteTablePartitionEntities } from "@esposter/db";
import { AzureContainer, AzureTable, resources } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { inArray } from "drizzle-orm";

// The compensating cleanup every create rolls back through — a duplicate whose content clone failed, a mid-deploy
// Failure that already created entries, a capture whose manifest upload failed after its row existed. A resource
// That never became durable must leave nothing behind, and everything it can leave is reached by its own id: the
// Blobs under its directory, and the activity trail createResourceRow opens at insert time, which nothing else
// Reclaims once the row that gates reading it is gone.
// Ordered blobs and trail first, the row last as the durable marker, and both halves guarded because neither may
// Take the row delete or the original error down with it: the caller would be told a cleanup step failed instead
// Of why the create did, and be left with exactly the half-created resource this cleanup exists to remove
export const deleteCreatedResources = async (ctx: AuthedContext, ids: Resource["id"][]): Promise<void> => {
  if (ids.length === 0) return;

  await getResultAsync(async () => {
    const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
    await Promise.all(ids.map((id) => deleteDirectory(containerClient, id)));
  }).match(noop, console.error);
  await getResultAsync(async () => {
    const resourceActivityClient = await useTableClient(AzureTable.ResourceActivity);
    await Promise.all(ids.map((id) => deleteTablePartitionEntities(resourceActivityClient, id)));
  }).match(noop, console.error);
  await ctx.db.delete(resources).where(inArray(resources.id, ids));
};
