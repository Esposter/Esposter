import type { Transaction } from "#server/models/db/Transaction";
import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { resourceVersionAssetsInResource, resourceWorkingAssetsInResource } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// Every asset a row of this resource names, in a stored version or in the working copy. A row keeps its asset, so a write
// That names one has no grace window to restart for it, and a write is only owed a touch for the rest. Read under the
// Resource's object lock, where no release can drop a row between this read and the write that relies on it
export const readReferencedAssetHashes = async (
  db: Context["db"] | Transaction,
  resourceId: ResourceInResource["id"],
): Promise<Set<string>> => {
  const versionRows = await db
    .selectDistinct({ assetHash: resourceVersionAssetsInResource.assetHash })
    .from(resourceVersionAssetsInResource)
    .where(eq(resourceVersionAssetsInResource.resourceId, resourceId));
  const workingRows = await db
    .selectDistinct({ assetHash: resourceWorkingAssetsInResource.assetHash })
    .from(resourceWorkingAssetsInResource)
    .where(eq(resourceWorkingAssetsInResource.resourceId, resourceId));
  return new Set([...versionRows, ...workingRows].map(({ assetHash }) => assetHash));
};
