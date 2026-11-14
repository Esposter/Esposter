import type { StorageBucket } from "@esposter/db-schema";

import type { StorageCredentials } from "#src/models/storage/StorageCredentials";

// The one place an S3 bucket name is built: the environment's prefix on the bucket's name. Both presigned helpers reach
// R2 through presignStorageUrl, which calls this, so a url can never name a bucket the environment does not have
export const getR2BucketName = ({ bucketPrefix }: Pick<StorageCredentials, "bucketPrefix">, bucket: StorageBucket) =>
  `${bucketPrefix}${bucket}`;
