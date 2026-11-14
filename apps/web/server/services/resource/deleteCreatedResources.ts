import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { ResourceInResource } from "@esposter/db-schema";

import { getBucket } from "#server/services/storage/getBucket";
import { deleteDirectory, inJsonArray } from "@esposter/db";
import { resourcesInResource, StorageBucket } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// The compensating cleanup every create rolls back through. A resource that never became durable must leave
// Nothing behind: its blobs under its directory first, and then the row, whose delete cascades to the activity trail
// `createResourceRow` opened. The blobs are guarded so a failed cleanup cannot take the row delete or the original error
// Down with it, which would tell the caller a cleanup step failed instead of why the create did
export const deleteCreatedResources = async (ctx: AuthedContext, ids: ResourceInResource["id"][]): Promise<void> => {
  if (ids.length === 0) return;

  await getResultAsync(async () => {
    const bucket = getBucket(StorageBucket.ResourceAssets);
    await Promise.all(ids.map((id) => deleteDirectory(bucket, id)));
  }).match(noop, console.error);
  await ctx.db.delete(resourcesInResource).where(inJsonArray(resourcesInResource.id, ids));
};
