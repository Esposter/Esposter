import type { R2Bucket } from "@cloudflare/workers-types";
import type { StorageBucket } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { deleteStorageBlobs } from "@esposter/db";

// A blob's delete and its release are one operation, and every owner it gave bytes back to is told. Every deletion in
// This Worker goes through here, so no caller can pass a release that tells nobody
export const deleteStorageBlobsAndBroadcast = (
  bucket: R2Bucket,
  storageBucket: StorageBucket,
  blobNames: string[],
): Promise<void> => deleteStorageBlobs(db, bucket, storageBucket, blobNames, broadcastStorageUsage);
