import type { ResourceInResource } from "@esposter/db-schema";

import { collectResourceAssetPaths } from "#server/services/resource/collectResourceAssetPaths";

// The asset hashes a serialized content value embeds for one resource. Every string is visited whatever the content
// Type, since the scan does not look at the schema, so a version whose content embeds an asset in any shape keeps it.
// Only a path that parses and names this resource's own file counts: another resource's file, a published-directory
// Path and a last segment that is not a content address name no reference to keep
export const getSnapshotAssetHashes = (resourceId: ResourceInResource["id"], content: unknown): Set<string> => {
  const { resourceAssetPaths } = collectResourceAssetPaths(content);
  const assetHashes = new Set<string>();
  for (const { hash, resourceId: assetResourceId } of resourceAssetPaths.values())
    if (assetResourceId === resourceId) assetHashes.add(hash);
  return assetHashes;
};
