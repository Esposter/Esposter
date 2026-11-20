import type { ResourceAssetPath } from "#shared/models/resource/ResourceAssetPath";

import { checkIsUuidV7 } from "#shared/services/id/checkIsUuidV7";
import { decodePathSegments } from "#shared/util/text/decodePathSegments";
import { FILES_DIRECTORY_SEGMENT } from "@esposter/db-schema";
import { ASSET_HASH_REGEX } from "@esposter/shared";

// The single decoder + validator for `/api/resource-assets/{encodedPath}` — shared by the serving endpoint and the
// Duplicate clone. Url segments map one-to-one onto blob-name segments, so rejecting any decoded segment that could
// Re-introduce a separator makes traversal impossible by construction: a `%2F`/`%2E%2E` can never widen the directory
// The caller was authorized for. An invalid path is data, not an error — it resolves to `undefined`
export const parseResourceAssetPath = (encodedPath: string): ResourceAssetPath | undefined => {
  const decodedSegments = decodePathSegments(encodedPath);
  if (
    !decodedSegments ||
    decodedSegments.some((segment) => segment === "." || segment === ".." || segment.includes("\\"))
  )
    return undefined;

  const [resourceId, directoryName, hash] = decodedSegments;
  if (decodedSegments.length !== 3 || directoryName !== FILES_DIRECTORY_SEGMENT) return undefined;
  if (!resourceId || !checkIsUuidV7(resourceId)) return undefined;
  if (!hash || !ASSET_HASH_REGEX.test(hash)) return undefined;

  return { blobName: decodedSegments.join("/"), hash, resourceId };
};
