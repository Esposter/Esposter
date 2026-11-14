import type { StorageCredentials } from "#src/models/storage/StorageCredentials";
import type { StorageBucket } from "@esposter/db-schema";

import { presignStorageUrl } from "#src/services/storage/presignStorageUrl";
import { WRITE_SAS_DURATION_MS } from "@esposter/db-schema";

// The url a client PUTs one object to. A given content type is part of the signature, so the upload has to send the type it
// was signed with. Without one, the signature leaves the type open, for a caller that only learns the file's type from the
// upload itself. An empty type is no type: a browser reports "" for a file it cannot name, and a signed empty header is one
// a request may not send at all. Either way the url carries no length bound: R2 does not enforce one on a presigned PUT
export const createPresignedPutUrl = (
  credentials: StorageCredentials,
  bucket: StorageBucket,
  objectKey: string,
  contentType?: string,
) =>
  presignStorageUrl(credentials, "PUT", bucket, objectKey, {
    expiresInMs: WRITE_SAS_DURATION_MS,
    headers: contentType ? { "Content-Type": contentType } : undefined,
  });
