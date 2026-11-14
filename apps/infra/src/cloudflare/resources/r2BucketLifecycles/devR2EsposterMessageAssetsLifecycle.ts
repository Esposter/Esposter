import { devR2EsposterMessageAssets } from "#src/cloudflare/resources/r2Buckets/devR2EsposterMessageAssets";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
  StorageBucket,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const bucketName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.R2Bucket,
  StorageBucket.MessageAssets,
);

// Azure's Cool tier at thirty days. R2 has no Cold tier, so the ninety-day step Azure takes has no equivalent here.
export const devR2EsposterMessageAssetsLifecycle: cloudflare.R2BucketLifecycle = new cloudflare.R2BucketLifecycle(
  `${bucketName}-lifecycle`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    bucketName: devR2EsposterMessageAssets.name,
    rules: [
      {
        conditions: { prefix: "" },
        enabled: true,
        id: "infrequent-access-after-thirty-days",
        storageClassTransitions: [
          { condition: { maxAge: 30 * 24 * 60 * 60, type: "Age" }, storageClass: "InfrequentAccess" },
        ],
      },
    ],
  },
  { parent: devR2EsposterMessageAssets, protect: true },
);
