import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { ResourceInResource, ResourceType } from "@esposter/db-schema";

// The single owner+type resource lookup shared by every owned read. Pass undefined as the type for cross-type lookups
// (e.g. the explorer's readResource). IsDeletedOnly inverts the soft-delete guard: a resource in the Recycle bin is
// Gone as far as every binding is concerned (its page 404s and its consumers read it as a dangling binding), while
// Restore/purge may only ever resolve a binned one
export const readOwnedResource = (
  ctx: AuthedContext,
  id: ResourceInResource["id"],
  type: ResourceType | undefined,
  isDeletedOnly = false,
): Promise<ResourceInResource | undefined> =>
  ctx.db.query.resourcesInResource.findFirst({
    where: {
      deletedAt: isDeletedOnly ? { isNotNull: true } : { isNull: true },
      id: { eq: id },
      ...(type === undefined ? {} : { type: { eq: type } }),
      userId: { eq: ctx.getSessionPayload.user.id },
    },
  });
