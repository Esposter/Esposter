import type { ResourceInResource } from "@esposter/db-schema";

import { RESOURCE_FILES_SEGMENT } from "#src/services/user/constants";

export const getResourceAssetBlobName = (resourceId: ResourceInResource["id"], assetHash: string) =>
  `${resourceId}/${RESOURCE_FILES_SEGMENT}/${assetHash}`;
