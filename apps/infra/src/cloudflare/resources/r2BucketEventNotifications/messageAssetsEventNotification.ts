import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { reconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/reconcileStorageLedgerEntry";
import { messageAssets } from "#src/cloudflare/resources/r2Buckets/messageAssets";
import * as cloudflare from "@pulumi/cloudflare";

// Object creation is the only event this notification carries.
export const messageAssetsEventNotification: cloudflare.R2BucketEventNotification =
  new cloudflare.R2BucketEventNotification(
    "r2BucketEventNotification-message-assets",
    {
      accountId: CloudflareAccountId,
      bucketName: messageAssets.name,
      queueId: reconcileStorageLedgerEntry.queueId,
      rules: [{ actions: ["PutObject", "CopyObject"] }],
    },
    { parent: messageAssets, protect: true },
  );
