import { devQEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/devQEsposterReconcileStorageLedgerEntry";
import { devR2EsposterMessageAssets } from "#src/cloudflare/resources/r2Buckets/devR2EsposterMessageAssets";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
  StorageBucket,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const bucketName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.R2Bucket,
  StorageBucket.MessageAssets,
);

// Object creation is the only event this notification carries.
export const devR2EsposterMessageAssetsEventNotification: cloudflare.R2BucketEventNotification =
  new cloudflare.R2BucketEventNotification(
    `${bucketName}-event-notification`,
    {
      accountId: CLOUDFLARE_ACCOUNT_ID,
      bucketName: devR2EsposterMessageAssets.name,
      queueId: devQEsposterReconcileStorageLedgerEntry.queueId,
      rules: [{ actions: ["PutObject", "CopyObject"] }],
    },
    { parent: devR2EsposterMessageAssets, protect: true },
  );
