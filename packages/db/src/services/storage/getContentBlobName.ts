import type { ResourceInResource } from "@esposter/db-schema";

export const getContentBlobName = (resourceId: ResourceInResource["id"]) => `${resourceId}/content.json`;
