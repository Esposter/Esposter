import type { ResourceAccess } from "#server/models/resource/ResourceAccess";
import type { Database, ResourceInResource } from "@esposter/db-schema";

import { findOwnedResource } from "#server/services/resource/findOwnedResource";
import { getLivePublicationWhere } from "@esposter/db";
import { resourcePublicationsInResource, resourcesInResource } from "@esposter/db-schema";
import { and, eq, exists, isNull, sql } from "drizzle-orm";

// The answers every asset of one resource shares, so a caller reads them once per resource rather than once per asset.
// Ownership is asked first and the publication only when it is not owned, so an owner's read is one query
// Read per call and never cached across calls: unpublish revokes anonymous access by tombstoning the publication row,
// And the asset is public only while the current publication's version names its hash, and only while the resource is
// Live
export const readResourceAccess = async (
  db: Database,
  resourceId: ResourceInResource["id"],
  userId?: string,
): Promise<ResourceAccess> => {
  if (userId) {
    const resource = await findOwnedResource(db, userId, resourceId, undefined);
    if (resource) return { isOwned: true };
  }

  const [publication] = await db
    .select()
    .from(resourcePublicationsInResource)
    .where(
      getLivePublicationWhere(
        and(
          eq(resourcePublicationsInResource.resourceId, resourceId),
          exists(
            db
              .select({ one: sql`1` })
              .from(resourcesInResource)
              .where(and(eq(resourcesInResource.id, resourceId), isNull(resourcesInResource.deletedAt))),
          ),
        ),
      ),
    )
    .limit(1);
  if (publication) return { isOwned: false, publishVersion: publication.publishVersion };
  else return { isOwned: false };
};
