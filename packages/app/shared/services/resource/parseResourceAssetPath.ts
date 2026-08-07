import type { ResourceAssetPath } from "#shared/models/resource/ResourceAssetPath";

import { FILES_DIRECTORY_SEGMENT, PUBLISHED_DIRECTORY_SEGMENT } from "#shared/services/resource/constants";
import { getDecodedUriComponent } from "@esposter/shared";
import { z } from "zod";

// Hoisted: this runs once per embedded asset url on a publish and once per asset request on a published page,
// So a page with hundreds of images would otherwise build and discard that many schemas
const UUID_SCHEMA = z.uuid();

// The single decoder + validator for `/api/resource-assets/{encodedPath}` — shared by the serving endpoint
// And the publish/duplicate clone service. Url segments map one-to-one onto blob-name segments, so rejecting
// Any decoded segment that could re-introduce a separator makes traversal impossible by construction: a
// `%2F`/`%2E%2E` can never widen the directory the caller was authorized for. An invalid path is data, not an
// Error — it resolves to `undefined`
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

  const [resourceId, directoryName, publishId, publishedFilesDirectoryName] = decodedSegments;
  if (resourceId === undefined || !UUID_SCHEMA.safeParse(resourceId).success) return undefined;

  const blobName = decodedSegments.join("/");
  if (decodedSegments.length === 3 && directoryName === FILES_DIRECTORY_SEGMENT)
    return { blobName, isPublished: false, resourceId };
  if (
    decodedSegments.length === 5 &&
    directoryName === PUBLISHED_DIRECTORY_SEGMENT &&
    // The publish clone directory is a per-attempt uuid, never the publishVersion — the clone runs before the
    // Transaction claims one (see createPublishedAssetsDirectoryName)
    publishId !== undefined &&
    UUID_SCHEMA.safeParse(publishId).success &&
    publishedFilesDirectoryName === FILES_DIRECTORY_SEGMENT
  )
    return { blobName, isPublished: true, resourceId };
  return undefined;
};
