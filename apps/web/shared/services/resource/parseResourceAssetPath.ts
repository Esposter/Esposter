import type { ResourceAssetPath } from "#shared/models/resource/ResourceAssetPath";

import { ASSET_HASH_REGEX } from "#shared/services/resource/constants";
import { checkIsUuidV4 } from "#shared/util/id/uuid/checkIsUuidV4";
import { FILES_DIRECTORY_SEGMENT } from "@esposter/db-schema";
import { getDecodedUriComponent } from "@esposter/shared";

// The single decoder + validator for `/api/resource-assets/{encodedPath}` — shared by the serving endpoint and the
// Duplicate clone. Url segments map one-to-one onto blob-name segments, so rejecting any decoded segment that could
// Re-introduce a separator makes traversal impossible by construction: a `%2F`/`%2E%2E` can never widen the directory
// The caller was authorized for. An invalid path is data, not an error — it resolves to `undefined`
export const parseResourceAssetPath = (encodedPath: string): ResourceAssetPath | undefined => {
  const decodedSegments: string[] = [];
  for (const segment of encodedPath.split("/")) {
    const decodedSegment = getDecodedUriComponent(segment, "");
    if (
      !decodedSegment ||
      decodedSegment === "." ||
      decodedSegment === ".." ||
      decodedSegment.includes("/") ||
      decodedSegment.includes("\\")
    )
      return undefined;
    decodedSegments.push(decodedSegment);
  }

  const [resourceId, directoryName, hash] = decodedSegments;
  if (decodedSegments.length !== 3 || directoryName !== FILES_DIRECTORY_SEGMENT) return undefined;
  if (!resourceId || !checkIsUuidV4(resourceId)) return undefined;
  if (!hash || !ASSET_HASH_REGEX.test(hash)) return undefined;

  return { blobName: decodedSegments.join("/"), hash, resourceId };
};
