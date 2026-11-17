import type { ResourceFile } from "#shared/models/resource/ResourceFile";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { ResourceInResource } from "@esposter/db-schema";

import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { listR2Objects } from "@esposter/db";
import { getResourceFilesDirectoryName } from "@esposter/db-schema";

// The files a resource holds, read off its files directory in the resource-assets bucket. A file's type is the one its
// Signed upload declared, since the type is part of that signature, so the listing needs no row beside each object
export const readResourceFiles = async (
  bucket: R2Bucket,
  resourceId: ResourceInResource["id"],
): Promise<ResourceFile[]> =>
  (await listR2Objects(bucket, `${getResourceFilesDirectoryName(resourceId)}/`, ["httpMetadata"])).map(
    ({ httpMetadata, key, size }) => ({
      mimetype: httpMetadata?.contentType ?? "",
      size,
      url: getResourceAssetUrl(key),
    }),
  );
