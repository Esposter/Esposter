import { devQEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/devQEsposterReconcileStorageLedgerEntry";
import { devR2EsposterResourceAssets } from "#src/cloudflare/resources/r2Buckets/devR2EsposterResourceAssets";
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
  StorageBucket.ResourceAssets,
);

// Object creation is the only event this notification carries.
export const devR2EsposterResourceAssetsEventNotification: cloudflare.R2BucketEventNotification =
  new cloudflare.R2BucketEventNotification(
    `${bucketName}-event-notification`,
    {
      accountId: CLOUDFLARE_ACCOUNT_ID,
      bucketName: devR2EsposterResourceAssets.name,
      queueId: devQEsposterReconcileStorageLedgerEntry.queueId,
      rules: [{ actions: ["PutObject", "CopyObject"] }],
    },
    { parent: devR2EsposterResourceAssets, protect: true },
  );
