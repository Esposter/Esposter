import type { StorageCredentials } from "#src/models/storage/StorageCredentials";
import type { FileEntity, StorageBucket } from "@esposter/db-schema";

import { createPresignedGetUrl } from "#src/services/storage/createPresignedGetUrl";
import { getThumbnailBlobName } from "#src/services/storage/getThumbnailBlobName";
import { THUMBNAIL_CONTENT_TYPE } from "@esposter/db-schema";

export const generateDownloadThumbnailSasUrls = (
  credentials: StorageCredentials,
  bucket: StorageBucket,
  files: Pick<FileEntity, "id">[],
  prefix = "",
) =>
  Promise.all(
    files.map(({ id }) =>
      createPresignedGetUrl(credentials, bucket, getThumbnailBlobName(prefix, id), {
        contentType: THUMBNAIL_CONTENT_TYPE,
      }),
    ),
  );
