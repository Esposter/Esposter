import type { IdMap } from "#src/models/cutover/IdMap";
import type { R2Client } from "#src/models/cutover/R2Client";
import type { BlobServiceClient } from "@azure/storage-blob";

export interface VerifyBucketObjectsOptions {
  azure: BlobServiceClient;
  bucket: string;
  client: R2Client;
  idMap: IdMap;
  r2Bucket: string;
}
