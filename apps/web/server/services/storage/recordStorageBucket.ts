import type { R2Bucket } from "@cloudflare/workers-types";
import type { StorageBucket } from "@esposter/db-schema";

import { requestBlobsStorage } from "#server/services/storage/requestBlobs";
import { recordBucket } from "@esposter/db";
import { getStorageBucketBindingName } from "@esposter/db-schema";

// Records a bucket's reads and writes into the request's blobs when a request is in scope, under its binding's name. The
// Production binding and the test stand-in both take this wrapping, so they record alike
export const recordStorageBucket = (storageBucket: StorageBucket, bucket: R2Bucket): R2Bucket =>
  recordBucket(bucket, getStorageBucketBindingName(storageBucket), () => requestBlobsStorage.getStore());
