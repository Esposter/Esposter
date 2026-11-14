import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { devMessageAssets } from "#src/cloudflare/resources/r2Buckets/devMessageAssets";
import * as cloudflare from "@pulumi/cloudflare";

// Azure's Cool tier at thirty days. R2 has no Cold tier, so the ninety-day step Azure takes has no equivalent here.
export const devMessageAssetsLifecycle: cloudflare.R2BucketLifecycle = new cloudflare.R2BucketLifecycle(
  "r2BucketLifecycle-dev-message-assets",
  {
    accountId: CloudflareAccountId,
    bucketName: devMessageAssets.name,
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
  { parent: devMessageAssets, protect: true },
);
