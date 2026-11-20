import type { StorageBucket } from "@esposter/db-schema";

import { requestBlobsStorage } from "#server/services/storage/requestBlobs";
import { recordStorageBlobWrite } from "@esposter/db";

// The confirm of a presigned upload records the key it landed at, so the procedure that confirms it publishes the key's write
export const confirmBlobUpload = (storageBucket: StorageBucket, key: string): void => {
  recordStorageBlobWrite(storageBucket, key, requestBlobsStorage.getStore());
};
