import type { ResourceInResource } from "@esposter/db-schema";

import { FILES_DIRECTORY_SEGMENT } from "@esposter/db-schema";

export const getResourceAssetBlobName = (resourceId: ResourceInResource["id"], assetHash: string) =>
  `${resourceId}/${FILES_DIRECTORY_SEGMENT}/${assetHash}`;
