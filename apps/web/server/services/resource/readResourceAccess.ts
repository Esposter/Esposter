import type { ResourceAccess } from "#server/models/resource/ResourceAccess";
import type { Database, ResourceInResource } from "@esposter/db-schema";

// The answers every asset of one resource shares, so a caller reads them once per resource rather than once per asset.
// Ownership is asked first and the publication only when it is not owned, so an owner's read is one query
// Read per call and never cached across calls: unpublish revokes anonymous access by deleting the publication row, and
// The asset is public only while the current publication's version names its hash
export const readResourceAccess = async (
  db: Database,
  resourceId: ResourceInResource["id"],
  userId?: string,
): Promise<ResourceAccess> => {
  if (userId) {
    const resource = await db.query.resourcesInResource.findFirst({
      where: { deletedAt: { isNull: true }, id: { eq: resourceId }, userId: { eq: userId } },
    });
    if (resource) return { isOwned: true };
  }

  const publication = await db.query.resourcePublicationsInResource.findFirst({
    where: { resourceId: { eq: resourceId } },
  });
  if (publication) return { isOwned: false, publishVersion: publication.publishVersion };
  else return { isOwned: false };
};
