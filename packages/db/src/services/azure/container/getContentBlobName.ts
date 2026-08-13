import type { Resource } from "@esposter/db-schema";

export const getContentBlobName = (resourceId: Resource["id"]) => `${resourceId}/content.json`;
