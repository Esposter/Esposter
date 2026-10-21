import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { lockSnapshotObjects } from "#server/services/resource/snapshot/lockSnapshotObjects";
import { touchSnapshotAssets } from "#server/services/resource/snapshot/touchSnapshotAssets";
import { resourceWorkingAssetsInResource } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// The first half of every content write, taken before anything is uploaded. Each asset the new content embeds joins the
// Working copy's reference rows, under the resource's object lock, and the stored ones are touched first so no collection
// Can take them before the rows name them. An asset that is not stored is referenced all the same: the content is the
// Owner's data, and a reference to a gone file is a broken image rather than a failed save. The rows name the old content's
// Assets as well as the new, so whichever way the upload or the commit lands they name every asset the stored blob can
// Hold — a surplus the next write settles, and never less than the blob embeds
export const reserveWorkingAssets = async (
  db: Context["db"],
  resourceId: ResourceInResource["id"],
  assetHashes: Set<string>,
): Promise<void> => {
  if (assetHashes.size === 0) return;

  await db.transaction(async (tx) => {
    await lockSnapshotObjects(tx, resourceId);
    const referencedRows = await tx
      .select({ assetHash: resourceWorkingAssetsInResource.assetHash })
      .from(resourceWorkingAssetsInResource)
      .where(eq(resourceWorkingAssetsInResource.resourceId, resourceId));
    const referencedHashes = new Set(referencedRows.map(({ assetHash }) => assetHash));
    // Only the assets not yet referenced are touched: a referenced one is kept by its row, so it needs no touch
    const addedHashes = new Set([...assetHashes].filter((assetHash) => !referencedHashes.has(assetHash)));
    await touchSnapshotAssets(resourceId, addedHashes);
    if (addedHashes.size > 0)
      await tx
        .insert(resourceWorkingAssetsInResource)
        .values(Array.from(addedHashes, (assetHash) => ({ assetHash, resourceId })));
  });
};
