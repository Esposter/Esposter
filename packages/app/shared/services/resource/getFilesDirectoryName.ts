import type { Resource } from "@esposter/db-schema";

export const getFilesDirectoryName = (resourceId: Resource["id"]) => `${resourceId}/files`;
