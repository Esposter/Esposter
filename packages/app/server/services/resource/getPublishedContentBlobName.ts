import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { getPublishedDirectoryName } from "@@/server/services/resource/getPublishedDirectoryName";

export const getPublishedContentBlobName = (
  resourceId: Resource["id"],
  publishVersion: ResourcePublication["publishVersion"],
) => `${getPublishedDirectoryName(resourceId, publishVersion)}.json`;
