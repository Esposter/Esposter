import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { messageAssets } from "#src/cloudflare/resources/r2Buckets/messageAssets";
import * as cloudflare from "@pulumi/cloudflare";

// Azure's Cool tier at thirty days. R2 has no Cold tier, so the ninety-day step Azure takes has no equivalent here.
export const messageAssetsLifecycle: cloudflare.R2BucketLifecycle = new cloudflare.R2BucketLifecycle(
  "r2BucketLifecycle-message-assets",
  {
    accountId: CloudflareAccountId,
    bucketName: messageAssets.name,
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
  { parent: messageAssets, protect: true },
);
