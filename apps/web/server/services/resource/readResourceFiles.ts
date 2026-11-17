import type { ResourceFile } from "#shared/models/resource/ResourceFile";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { ResourceInResource } from "@esposter/db-schema";

import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { listR2Objects } from "@esposter/db";
import { getResourceFilesDirectoryName } from "@esposter/db-schema";

// The files a resource holds, read off its files directory in the resource-assets bucket. A file's type is the one its
// Latest upload declared: a signed upload's type is part of its signature, and a re-upload of held bytes rewrites the
// Stored type, so the listing needs no row beside each object
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
