import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { reconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/reconcileStorageLedgerEntry";
import { resourceAssets } from "#src/cloudflare/resources/r2Buckets/resourceAssets";
import * as cloudflare from "@pulumi/cloudflare";

// Object creation is the only event this notification carries.
export const resourceAssetsEventNotification: cloudflare.R2BucketEventNotification =
  new cloudflare.R2BucketEventNotification(
    "r2BucketEventNotification-resource-assets",
    {
      accountId: CloudflareAccountId,
      bucketName: resourceAssets.name,
      queueId: reconcileStorageLedgerEntry.queueId,
      rules: [{ actions: ["PutObject", "CopyObject"] }],
    },
    { parent: resourceAssets, protect: true },
  );
