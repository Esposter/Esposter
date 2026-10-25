import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { UpdateResourceInput } from "#shared/models/db/resource/UpdateResourceInput";
import type { ResourceInResource } from "@esposter/db-schema";

import { writeResourceActivity } from "#server/services/resource/writeResourceActivity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { DatabaseEntityType, ResourceActivityType, resourcesInResource } from "@esposter/db-schema";
import { getSynchronizedFunction, Operation } from "@esposter/shared";
import { eq } from "drizzle-orm";

// The one rename-and-tag write, shared by the typed update and the typeless one, so both leave the same trail. Only
// The fields the caller sends are written, and the content is never touched
export const updateResourceRow = async (
  ctx: AuthedContext,
  resource: ResourceInResource,
  values: Omit<UpdateResourceInput, "id">,
): Promise<ResourceInResource> => {
  const oldName = resource.name;
  const updatedResource = requireMutation(
    (
      await ctx.db.update(resourcesInResource).set(values).where(eq(resourcesInResource.id, resource.id)).returning()
    )[0],
    Operation.Update,
    DatabaseEntityType.Resource,
    resource.id,
  );
  // A tags-only edit is not a rename, so it leaves no Renamed entry.
  // Best-effort: a failed write loses one trail entry, never the rename.
  if (updatedResource.name !== oldName)
    getSynchronizedFunction(writeResourceActivity)(ctx, {
      activityType: ResourceActivityType.Renamed,
      newName: updatedResource.name,
      oldName,
      resourceId: resource.id,
    });
  return updatedResource;
};
