import type { RecordedBlobs } from "#src/models/realtime/RecordedBlobs";
import type { StorageBucket } from "@esposter/db-schema";

import { recordBlobWrite } from "#src/services/realtime/recordBlobWrite";
import { getStorageBucketBindingName } from "@esposter/db-schema";

// A presigned upload lands in R2 without going through the binding, so its PUT records nothing. The confirm that
// Records the upload names the key here, and the key's write publishes as a put's does
export const recordStorageBlobWrite = (
  storageBucket: StorageBucket,
  key: string,
  blobs: RecordedBlobs | undefined,
): void => {
  recordBlobWrite(blobs, getStorageBucketBindingName(storageBucket), key);
};
