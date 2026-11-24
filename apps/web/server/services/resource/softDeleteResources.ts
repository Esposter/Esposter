import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { getLivePublicationWhere } from "@esposter/db";
import { resourcePublicationsInResource, resourcesInResource } from "@esposter/db-schema";
import { inArray } from "drizzle-orm";

// Soft: the rows, their content blobs and their {id}/ directories all survive the Recycle bin window, which is
// What makes restore possible, and purge is what destroys them. One batch, so a soft-deleted resource can never linger
// Publicly served. The publication is tombstoned first, so its subquery still matches the rows the update is about to
// Soft-delete
export const softDeleteResources = async (db: Context["db"], where: SQL | undefined): Promise<ResourceInResource[]> => {
  const [, deletedResources] = await db.batch([
    db
      .update(resourcePublicationsInResource)
      .set({ deletedAt: new Date() })
      .where(
        getLivePublicationWhere(
          inArray(
            resourcePublicationsInResource.resourceId,
            db.select({ id: resourcesInResource.id }).from(resourcesInResource).where(where),
          ),
        ),
      ),
    // A deleted resource must not stay publicly served, so restore deliberately returns a Draft
    db.update(resourcesInResource).set({ deletedAt: new Date() }).where(where).returning(),
  ]);
  return deletedResources;
};
