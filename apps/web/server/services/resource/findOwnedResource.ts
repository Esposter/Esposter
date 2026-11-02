import type { Database, ResourceInResource, ResourceType } from "@esposter/db-schema";

// The single owner+type resource lookup shared by every owned read. Pass undefined as the type for cross-type lookups
// (e.g. the explorer's readResource). IsDeletedOnly inverts the soft-delete guard: a resource in the Recycle bin is
// Gone as far as every binding is concerned (its page 404s and its consumers read it as a dangling binding), while
// Restore/purge may only ever resolve a binned one. It takes the db and the user id, not a context, so a caller with
// none, such as readResourceAccess (which also serves anonymous readers), asks the same question through this lookup
export const findOwnedResource = (
  db: Database,
  userId: string,
  id: ResourceInResource["id"],
  type: ResourceType | undefined,
  isDeletedOnly = false,
): Promise<ResourceInResource | undefined> =>
  db.query.resourcesInResource.findFirst({
    where: {
      deletedAt: isDeletedOnly ? { isNotNull: true } : { isNull: true },
      id: { eq: id },
      ...(type === undefined ? {} : { type: { eq: type } }),
      userId: { eq: userId },
    },
  });
