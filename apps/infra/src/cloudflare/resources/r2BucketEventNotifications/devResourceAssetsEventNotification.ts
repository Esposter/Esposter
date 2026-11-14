import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { devReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/devReconcileStorageLedgerEntry";
import { devResourceAssets } from "#src/cloudflare/resources/r2Buckets/devResourceAssets";
import * as cloudflare from "@pulumi/cloudflare";

// Object creation is the only event this notification carries.
export const devResourceAssetsEventNotification: cloudflare.R2BucketEventNotification =
  new cloudflare.R2BucketEventNotification(
    "r2BucketEventNotification-dev-resource-assets",
    {
      accountId: CloudflareAccountId,
      bucketName: devResourceAssets.name,
      queueId: devReconcileStorageLedgerEntry.queueId,
      rules: [{ actions: ["PutObject", "CopyObject"] }],
    },
    { parent: devResourceAssets, protect: true },
  );
