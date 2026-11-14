import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { devQEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/devQEsposterReconcileStorageLedgerEntry";
import { devR2EsposterResourceAssets } from "#src/cloudflare/resources/r2Buckets/devR2EsposterResourceAssets";
import * as cloudflare from "@pulumi/cloudflare";

// Object creation is the only event this notification carries.
export const devR2EsposterResourceAssetsEventNotification: cloudflare.R2BucketEventNotification =
  new cloudflare.R2BucketEventNotification(
    "r2BucketEventNotification-dev-resource-assets",
    {
      accountId: CloudflareAccountId,
      bucketName: devR2EsposterResourceAssets.name,
      queueId: devQEsposterReconcileStorageLedgerEntry.queueId,
      rules: [{ actions: ["PutObject", "CopyObject"] }],
    },
    { parent: devR2EsposterResourceAssets, protect: true },
  );
