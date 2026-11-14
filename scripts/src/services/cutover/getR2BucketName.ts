import type { CutoverEnvironment } from "#src/models/cutover/CutoverEnvironment";

import { getCloudflareEnvironment } from "#src/services/cutover/getCloudflareEnvironment";
import { CloudflareAssetType, getCloudflareResourceName, StorageBucket } from "@esposter/db-schema";

// Each Blob container's R2 bucket, named by the same naming function Pulumi uses, so the copy writes where the resource is
export const getR2BucketName = (environment: CutoverEnvironment, bucket: StorageBucket) =>
  getCloudflareResourceName(getCloudflareEnvironment(environment), CloudflareAssetType.R2Bucket, bucket);
