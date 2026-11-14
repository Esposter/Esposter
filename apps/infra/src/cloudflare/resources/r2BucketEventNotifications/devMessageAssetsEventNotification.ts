import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { devReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/devReconcileStorageLedgerEntry";
import { devMessageAssets } from "#src/cloudflare/resources/r2Buckets/devMessageAssets";
import * as cloudflare from "@pulumi/cloudflare";

// Object creation is the only event this notification carries.
export const devMessageAssetsEventNotification: cloudflare.R2BucketEventNotification =
  new cloudflare.R2BucketEventNotification(
    "r2BucketEventNotification-dev-message-assets",
    {
      accountId: CloudflareAccountId,
      bucketName: devMessageAssets.name,
      queueId: devReconcileStorageLedgerEntry.queueId,
      rules: [{ actions: ["PutObject", "CopyObject"] }],
    },
    { parent: devMessageAssets, protect: true },
  );
