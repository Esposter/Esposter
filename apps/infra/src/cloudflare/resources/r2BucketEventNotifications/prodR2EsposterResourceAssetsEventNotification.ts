import { prodQEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/prodQEsposterReconcileStorageLedgerEntry";
import { prodR2EsposterResourceAssets } from "#src/cloudflare/resources/r2Buckets/prodR2EsposterResourceAssets";
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
  StorageBucket.ResourceAssets,
);

// Object creation is the only event this notification carries.
export const prodR2EsposterResourceAssetsEventNotification: cloudflare.R2BucketEventNotification =
  new cloudflare.R2BucketEventNotification(
    `${bucketName}-event-notification`,
    {
      accountId: CLOUDFLARE_ACCOUNT_ID,
      bucketName: prodR2EsposterResourceAssets.name,
      queueId: prodQEsposterReconcileStorageLedgerEntry.queueId,
      rules: [{ actions: ["PutObject", "CopyObject"] }],
    },
    { parent: prodR2EsposterResourceAssets, protect: true },
  );
