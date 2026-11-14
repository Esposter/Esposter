import type { StorageCredentials } from "#src/models/storage/StorageCredentials";
import type { FileEntity, StorageBucket } from "@esposter/db-schema";

import { createPresignedGetUrl } from "#src/services/storage/createPresignedGetUrl";
import { getAttachmentContentDisposition } from "#src/services/storage/getAttachmentContentDisposition";
import { getFileBlobNames } from "#src/services/storage/getFileBlobNames";

export const generateDownloadFileSasUrls = (
  credentials: StorageCredentials,
  bucket: StorageBucket,
  files: Pick<FileEntity, "filename" | "id" | "mimetype">[],
  prefix = "",
) =>
  Promise.all(
    files.map(({ filename, id, mimetype }) => {
      const { blobName } = getFileBlobNames(prefix, id, filename);
      return createPresignedGetUrl(credentials, bucket, blobName, {
        contentDisposition: getAttachmentContentDisposition(filename),
        contentType: mimetype,
      });
    }),
  );
