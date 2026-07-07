import type { Resource } from "@esposter/db-schema";

export const getPublishedContentBlobName = (resourceId: Resource["id"], publishVersion: Resource["publishVersion"]) =>
  `${resourceId}/published/${publishVersion}`;
