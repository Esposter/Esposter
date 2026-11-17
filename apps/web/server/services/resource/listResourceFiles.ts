import type { ResourceFile } from "#shared/models/resource/ResourceFile";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { ResourceInResource } from "@esposter/db-schema";

import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { getResourceFilesDirectoryName } from "@esposter/db-schema";
import { omitUndefined } from "@esposter/shared";

// The files a resource holds, read off its files directory in the resource-assets bucket. A file's type is the one its
// Signed upload declared, since the type is part of that signature, so the listing needs no row beside each object. Every
// Page of the listing is read, as the call-background listing is
export const listResourceFiles = async (
  bucket: R2Bucket,
  resourceId: ResourceInResource["id"],
): Promise<ResourceFile[]> => {
  const prefix = `${getResourceFilesDirectoryName(resourceId)}/`;
  const files: ResourceFile[] = [];
  let cursor: string | undefined;
  const include: "httpMetadata"[] = ["httpMetadata"];
  do {
    // oxlint-disable-next-line no-await-in-loop -- Pagination: each page's cursor is what the next page is requested with
    const page = await bucket.list(omitUndefined({ cursor, include, prefix }));
    for (const { httpMetadata, key, size } of page.objects)
      files.push({ mimetype: httpMetadata?.contentType ?? "", size, url: getResourceAssetUrl(key) });
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  return files;
};
