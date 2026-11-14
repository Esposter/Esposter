import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { prodQEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/prodQEsposterReconcileStorageLedgerEntry";
import { prodR2EsposterMessageAssets } from "#src/cloudflare/resources/r2Buckets/prodR2EsposterMessageAssets";
import {
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
  StorageBucket,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const bucketName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.R2Bucket,
  StorageBucket.MessageAssets,
);

// Object creation is the only event this notification carries.
export const prodR2EsposterMessageAssetsEventNotification: cloudflare.R2BucketEventNotification =
  new cloudflare.R2BucketEventNotification(
    `${bucketName}-event-notification`,
    {
      accountId: CloudflareAccountId,
      bucketName: prodR2EsposterMessageAssets.name,
      queueId: prodQEsposterReconcileStorageLedgerEntry.queueId,
      rules: [{ actions: ["PutObject", "CopyObject"] }],
    },
    { parent: prodR2EsposterMessageAssets, protect: true },
  );
