import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource, ResourceTags, ResourceType } from "@esposter/db-schema";

import { writeResourceActivity } from "@@/server/services/resource/writeResourceActivity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { DatabaseEntityType, ResourceActivityType, resources } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// Every path that brings a resource into existence — create, duplicate, blueprint capture and deploy —
// Inserts the row through here, so the row and the activity entry opening its trail cannot drift apart.
// A trail that starts at the first manual save cannot say when or how the resource came to exist.
// The entry is written at insert time rather than once the caller's follow-up work is durable, so that no path
// Can insert a row and forget it. A create its caller rolls back (a failed content clone, a failed deploy) would
// Otherwise strand the entry — unreachable once the row is gone, since reading a trail is gated on the row — so
// The compensating cleanup those callers roll back through drops the trail with the row (deleteCreatedResources)
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
  // Awaited, unlike every other activity write: this is the one entry a caller can roll back over, and the
  // Cleanup deletes the trail partition. An in-flight write would land after that delete and resurrect the entry
  // As an orphan no read can reach. The write never rejects, so awaiting it costs latency and nothing else
  await writeResourceActivity({ activityType, resourceId: newResource.id, userId });
  return newResource;
};
