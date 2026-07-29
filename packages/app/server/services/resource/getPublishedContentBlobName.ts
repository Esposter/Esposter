import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { PUBLISHED_DIRECTORY_SEGMENT } from "#shared/services/resource/constants";
// The snapshot of a publication's content. `{id}/published/{version}` is this blob's stem, not a directory — a
// Publication's assets live under `{id}/published/{publishId}/`, keyed by the publish attempt's uuid.
export const getPublishedContentBlobName = (
  resourceId: Resource["id"],
  publishVersion: ResourcePublication["publishVersion"],
) => `${resourceId}/${PUBLISHED_DIRECTORY_SEGMENT}/${publishVersion}.json`;
