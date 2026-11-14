import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { prodQEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/prodQEsposterReconcileStorageLedgerEntry";
import { prodR2EsposterResourceAssets } from "#src/cloudflare/resources/r2Buckets/prodR2EsposterResourceAssets";
import * as cloudflare from "@pulumi/cloudflare";

// Object creation is the only event this notification carries.
export const prodR2EsposterResourceAssetsEventNotification: cloudflare.R2BucketEventNotification =
  new cloudflare.R2BucketEventNotification(
    "r2BucketEventNotification-resource-assets",
    {
      accountId: CloudflareAccountId,
      bucketName: prodR2EsposterResourceAssets.name,
      queueId: prodQEsposterReconcileStorageLedgerEntry.queueId,
      rules: [{ actions: ["PutObject", "CopyObject"] }],
    },
    { parent: prodR2EsposterResourceAssets, protect: true },
  );
