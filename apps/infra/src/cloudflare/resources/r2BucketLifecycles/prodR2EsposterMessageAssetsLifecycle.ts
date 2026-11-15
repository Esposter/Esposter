import { prodR2EsposterMessageAssets } from "#src/cloudflare/resources/r2Buckets/prodR2EsposterMessageAssets";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
  StorageBucket,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const bucketName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.R2Bucket,
  StorageBucket.MessageAssets,
);
// An attachment is read mostly in its first month, so after thirty days its blob moves to Infrequent Access, which
// Stores for less and charges per read. R2 has no colder class to step down to after that
export const prodR2EsposterMessageAssetsLifecycle: cloudflare.R2BucketLifecycle = new cloudflare.R2BucketLifecycle(
  `${bucketName}-lifecycle`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    bucketName: prodR2EsposterMessageAssets.name,
    rules: [
      {
        conditions: { prefix: "" },
        enabled: true,
        id: "infrequent-access-after-thirty-days",
        storageClassTransitions: [
          {
            condition: { maxAge: Temporal.Duration.from({ days: 30 }).total("seconds"), type: "Age" },
            storageClass: "InfrequentAccess",
          },
        ],
      },
    ],
  },
  { parent: prodR2EsposterMessageAssets, protect: true },
);
