import type { ResourceInResource } from "@esposter/db-schema";

import { collectResourceAssetPaths } from "#server/services/resource/collectResourceAssetPaths";

// The asset hashes a serialized content value names by url for one resource. Every string is visited whatever the content
// Type, since the scan does not look at the schema. Only a path that parses and names this resource's own file counts:
// Another resource's file, a published-directory path and a last segment that is not a content address name no file this
// Resource serves. The publish refusal asks this question, since only a file the resource is promised to serve can refuse one
export const getSnapshotUrlAssetHashes = (resourceId: ResourceInResource["id"], content: unknown): Set<string> => {
  const { resourceAssetPaths } = collectResourceAssetPaths(content);
  const assetHashes = new Set<string>();
  for (const { hash, resourceId: assetResourceId } of resourceAssetPaths.values())
    if (assetResourceId === resourceId) assetHashes.add(hash);
  return assetHashes;
};
