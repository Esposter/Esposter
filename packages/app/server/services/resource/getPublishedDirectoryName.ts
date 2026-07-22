import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { PUBLISHED_DIRECTORY_SEGMENT } from "#shared/services/resource/constants";

export const getPublishedDirectoryName = (
  resourceId: Resource["id"],
  publishVersion: ResourcePublication["publishVersion"],
) => `${resourceId}/${PUBLISHED_DIRECTORY_SEGMENT}/${publishVersion}`;
