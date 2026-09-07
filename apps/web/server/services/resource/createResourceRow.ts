import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource, ResourceTags, ResourceType } from "@esposter/db-schema";

import { writeResourceActivity } from "@@/server/services/resource/writeResourceActivity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { DatabaseEntityType, ResourceActivityType, resources } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// Every path that brings a resource into existence — create, duplicate, blueprint capture and deploy — inserts
// The row through here, so the row and the activity entry opening its trail cannot drift apart: a trail starting
// At the first manual save cannot say how the resource came to exist. The entry is written at insert time rather
// Than once the caller's follow-up work is durable, so no path can insert a row and forget it, and the create a
// Caller rolls back drops the trail with the row (deleteCreatedResources) rather than stranding an entry no read
// Can reach
export const createResourceRow = async (
  ctx: AuthedContext,
  values: { name: Resource["name"]; tags?: ResourceTags; type: ResourceType },
  activityType: ResourceActivityType.Created | ResourceActivityType.Duplicated = ResourceActivityType.Created,
): Promise<Resource> => {
  const userId = ctx.getSessionPayload.user.id;
  const newResource = requireMutation(
    (
      await ctx.db
        .insert(resources)
        .values({ ...values, userId })
        .returning()
    )[0],
    Operation.Create,
    DatabaseEntityType.Resource,
    userId,
  );
  // Awaited, unlike every other activity write: this is the one entry a caller can roll back over, and an
  // In-flight write would land after the cleanup's partition delete and resurrect it as an orphan. The write
  // Never rejects, so awaiting it costs latency and nothing else
  await writeResourceActivity({ activityType, resourceId: newResource.id, userId });
  return newResource;
};
