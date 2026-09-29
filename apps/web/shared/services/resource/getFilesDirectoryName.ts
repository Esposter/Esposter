import type { ResourceInResource } from "@esposter/db-schema";

import { FILES_DIRECTORY_SEGMENT } from "#shared/services/resource/constants";

export const getFilesDirectoryName = (resourceId: ResourceInResource["id"]) =>
  `${resourceId}/${FILES_DIRECTORY_SEGMENT}`;
