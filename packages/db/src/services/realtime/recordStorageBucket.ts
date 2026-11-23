import type { RecordedBlobs } from "#src/models/realtime/RecordedBlobs";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { StorageBucket } from "@esposter/db-schema";

import { recordBucket } from "#src/services/realtime/recordBucket";
import { getStorageBucketBindingName } from "@esposter/db-schema";

// Records a storage bucket's reads and writes under its binding's name, into the blobs the scope holds when a call
// Runs. Each App passes its own scope, so a binding records nothing outside a request or a unit of work
export const recordStorageBucket = (
  storageBucket: StorageBucket,
  bucket: R2Bucket,
  getBlobs: () => RecordedBlobs | undefined,
): R2Bucket => recordBucket(bucket, getStorageBucketBindingName(storageBucket), getBlobs);
