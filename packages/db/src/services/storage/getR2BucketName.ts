import type { CloudflareEnvironment, StorageBucket } from "@esposter/db-schema";

import { CloudflareAssetType, getCloudflareResourceName } from "@esposter/db-schema";

// The one place an S3 bucket name is built: the environment's spelling of the bucket's R2 name, the same one Pulumi
// creates the bucket under. Both presigned helpers reach R2 through presignStorageUrl, which calls this, so a url can
// never name a bucket the environment does not have
export const getR2BucketName = (environment: CloudflareEnvironment, bucket: StorageBucket) =>
  getCloudflareResourceName(environment, CloudflareAssetType.R2Bucket, bucket);
