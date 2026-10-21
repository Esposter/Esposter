import type { Transaction } from "#server/models/db/Transaction";
import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { resourceWorkingAssetsInResource } from "@esposter/db-schema";
import { and, eq, notInArray } from "drizzle-orm";

// The second half of a content write, taken with the write once its blob has landed. The rows the new content no longer
// Embeds are dropped, so the rows name exactly what the stored content embeds. The caller releases the hashes handed back,
// After its own commit, through the one release every path takes
export const pruneWorkingAssets = async (
  db: Context["db"] | Transaction,
  resourceId: ResourceInResource["id"],
  assetHashes: Set<string>,
): Promise<string[]> => {
  const droppedRows = await db
    .delete(resourceWorkingAssetsInResource)
    .where(
      and(
        eq(resourceWorkingAssetsInResource.resourceId, resourceId),
        assetHashes.size > 0 ? notInArray(resourceWorkingAssetsInResource.assetHash, [...assetHashes]) : undefined,
      ),
    )
    .returning({ assetHash: resourceWorkingAssetsInResource.assetHash });
  return droppedRows.map(({ assetHash }) => assetHash);
};
