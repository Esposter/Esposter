import type { Resource } from "@esposter/db-schema";

import { FILES_DIRECTORY_SEGMENT } from "#shared/services/resource/constants";

export const getFilesDirectoryName = (resourceId: Resource["id"]) => `${resourceId}/${FILES_DIRECTORY_SEGMENT}`;
