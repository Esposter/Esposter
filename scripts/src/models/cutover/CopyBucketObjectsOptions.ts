import type { IdMap } from "#src/models/cutover/IdMap";
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
  // Every object is stored under the key the id map gives its name, and its textual content is written with the ids rewritten
  idMap: IdMap;
  r2Bucket: string;
}
