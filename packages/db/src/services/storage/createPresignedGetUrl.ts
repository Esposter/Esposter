import type { StorageCredentials } from "#src/models/storage/StorageCredentials";
import type { StorageBucket } from "@esposter/db-schema";

import { presignStorageUrl } from "#src/services/storage/presignStorageUrl";
import { READ_SAS_DURATION_MS } from "@esposter/db-schema";

// The url a client GETs one object from. The response headers are signed into the query, so R2 serves them as given
export const createPresignedGetUrl = (
  credentials: StorageCredentials,
  bucket: StorageBucket,
  objectKey: string,
  {
    contentDisposition,
    contentType,
    expiresInMs = READ_SAS_DURATION_MS,
  }: { contentDisposition?: string; contentType?: string; expiresInMs?: number } = {},
) =>
  presignStorageUrl(credentials, "GET", bucket, objectKey, {
    expiresInMs,
    searchParams: {
      ...(contentDisposition && { "response-content-disposition": contentDisposition }),
      ...(contentType && { "response-content-type": contentType }),
    },
  });
