import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { touchSnapshotAssets } from "#server/services/resource/snapshot/touchSnapshotAssets";
import { resourceWorkingAssetsInResource } from "@esposter/db-schema";
import { eq, sql } from "drizzle-orm";

// The first half of every content write, taken before anything is uploaded. Each asset the new content embeds joins the
// Working copy's reference rows, and the stored ones are touched first so no collection can take them before the rows
// name them. An asset that is not stored is referenced all the same: the content is the owner's data, and a reference to
// a gone file is a broken image rather than a failed save. The rows name the old content's assets as well as the new, so
// whichever way the upload or the commit lands they name every asset the stored blob can hold — a surplus the next write
// settles, and never less than the blob embeds
export const reserveWorkingAssets = async (
  db: Context["db"],
  resourceId: ResourceInResource["id"],
  assetHashes: Set<string>,
): Promise<void> => {
  if (assetHashes.size === 0) return;

  const referencedRows = await db
    .select({ assetHash: resourceWorkingAssetsInResource.assetHash })
    .from(resourceWorkingAssetsInResource)
    .where(eq(resourceWorkingAssetsInResource.resourceId, resourceId));
  const referencedHashes = new Set(referencedRows.map(({ assetHash }) => assetHash));
  // Only the assets not yet referenced are touched: a referenced one is kept by its row, so it needs no touch
  const addedHashes = new Set([...assetHashes].filter((assetHash) => !referencedHashes.has(assetHash)));
  await touchSnapshotAssets(resourceId, addedHashes);
  // A concurrent reserve of the same asset may have written the row since the read, which is the same reference. One statement
  // over a JSON array, since a bind limit of 100 parameters per statement would cap a document at a few dozen assets
  // Epoch milliseconds, since an insert from a select takes no JS default for the timestamp columns
  const now = Date.now();
  if (addedHashes.size > 0)
    await db
      .insert(resourceWorkingAssetsInResource)
      .select(
        db
          .select({
            assetHash: sql<string>`asset.value`,
            createdAt: sql<Date>`${now}`,
            resourceId: sql<string>`${resourceId}`,
            updatedAt: sql<Date>`${now}`,
          })
          .from(sql`json_each(${JSON.stringify([...addedHashes])}) AS asset`)
          .where(sql`true`),
      )
      .onConflictDoNothing();
};
