import type { ResourceInResource } from "@esposter/db-schema";

import { FILES_DIRECTORY_SEGMENT } from "@esposter/db-schema";

export const getFilesDirectoryName = (resourceId: ResourceInResource["id"]) =>
  `${resourceId}/${FILES_DIRECTORY_SEGMENT}`;
