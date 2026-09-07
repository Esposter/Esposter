import type { Context } from "@@/server/trpc/context";
import type { Resource } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { resourcePublications, resources } from "@esposter/db-schema";
import { inArray } from "drizzle-orm";

// Soft: the rows, their content blobs and their {id}/ directories all survive the Recycle bin window, which is
// What makes restore possible, and purge is what destroys them. One transaction, so a soft-deleted resource can
// Never linger publicly served
export const softDeleteResources = (db: Context["db"], where: SQL | undefined): Promise<Resource[]> =>
  db.transaction(async (tx) => {
    const deletedResources = await tx.update(resources).set({ deletedAt: new Date() }).where(where).returning();
    // A deleted resource must not stay publicly served, so restore deliberately returns a Draft
    if (deletedResources.length > 0)
      await tx.delete(resourcePublications).where(
        inArray(
          resourcePublications.resourceId,
          deletedResources.map(({ id }) => id),
        ),
      );
    return deletedResources;
  });
