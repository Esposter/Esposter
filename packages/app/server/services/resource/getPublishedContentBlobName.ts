import type { Resource, ResourcePublication } from "@esposter/db-schema";

export const getPublishedContentBlobName = (
  resourceId: Resource["id"],
  publishVersion: ResourcePublication["publishVersion"],
) => `${resourceId}/published/${publishVersion}.json`;
