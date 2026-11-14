import type { R2Client } from "#src/models/cutover/R2Client";
import type { BlobServiceClient } from "@azure/storage-blob";

export interface CopyBucketObjectsOptions {
  archiveBucket: string;
  azure: BlobServiceClient;
  // The container and the StorageBucket value it is named by
  bucket: string;
  client: R2Client;
  // The freeze's run: copies what changed since the full copy began and deletes what Azure no longer lists
  delta: boolean;
  r2Bucket: string;
}
