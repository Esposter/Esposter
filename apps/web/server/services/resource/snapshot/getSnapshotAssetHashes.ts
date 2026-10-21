import type { ResourceInResource } from "@esposter/db-schema";

import { relativizeOwnAssetUrls } from "#server/services/resource/relativizeOwnAssetUrls";
import { ASSET_HASH_REGEX, RESOURCE_ASSET_URL_REGEX } from "#shared/services/resource/constants";
import { getResourceFileBlobName } from "#shared/services/resource/getResourceFileBlobName";
import { parseResourceAssetPath } from "#shared/services/resource/parseResourceAssetPath";
import { deepVisitStrings } from "#shared/util/object/deepVisitStrings";

// The hash an encoded asset path names when it is this resource's own file, or undefined for any other path: another
// Resource's file, a published-directory path and a last segment that is not a content address all name no reference
const getOwnAssetHash = (resourceId: ResourceInResource["id"], encodedPath: string) => {
  const resourceAssetPath = parseResourceAssetPath(encodedPath);
  if (resourceAssetPath?.resourceId !== resourceId) return undefined;

  const { blobName } = resourceAssetPath;
  const hash = blobName.slice(blobName.lastIndexOf("/") + 1);
  return blobName === getResourceFileBlobName(resourceId, hash) && ASSET_HASH_REGEX.test(hash) ? hash : undefined;
};
// The asset hashes a serialized content value embeds for one resource. Every string is visited whatever the content
// Type, since the scan does not look at the schema, so a version whose content embeds an asset in any shape keeps it
export const getSnapshotAssetHashes = (resourceId: ResourceInResource["id"], content: unknown): Set<string> => {
  const assetHashes = new Set<string>();
  deepVisitStrings(relativizeOwnAssetUrls(content), (value) => {
    for (const { groups } of value.matchAll(RESOURCE_ASSET_URL_REGEX)) {
      const assetHash = getOwnAssetHash(resourceId, groups?.encodedPath ?? "");
      if (assetHash) assetHashes.add(assetHash);
    }
  });
  return assetHashes;
};
