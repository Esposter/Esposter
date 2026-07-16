import type { Resource, ResourcePublication } from "@esposter/db-schema";

export const getPublishedDirectoryName = (
  resourceId: Resource["id"],
  publishVersion: ResourcePublication["publishVersion"],
) => `${resourceId}/published/${publishVersion}`;
