import type { ResourceInResource } from "@esposter/db-schema";

import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";

export const getResourceFileBlobName = (resourceId: ResourceInResource["id"], hash: string) =>
  `${getFilesDirectoryName(resourceId)}/${hash}`;
