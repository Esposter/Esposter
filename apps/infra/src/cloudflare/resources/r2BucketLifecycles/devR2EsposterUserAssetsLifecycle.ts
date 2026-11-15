import { devR2EsposterUserAssets } from "#src/cloudflare/resources/r2Buckets/devR2EsposterUserAssets";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  DATA_EXPORT_BLOB_PREFIX,
  DATA_EXPORT_RETENTION_MS,
  getCloudflareResourceName,
  StorageBucket,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const bucketName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.R2Bucket,
  StorageBucket.UserAssets,
);
// A data export archive outlives its row's expiry by nothing: the bucket deletes it once the same retention has passed
export const devR2EsposterUserAssetsLifecycle: cloudflare.R2BucketLifecycle = new cloudflare.R2BucketLifecycle(
  `${bucketName}-lifecycle`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    bucketName: devR2EsposterUserAssets.name,
    rules: [
      {
        conditions: { prefix: DATA_EXPORT_BLOB_PREFIX },
        deleteObjectsTransition: { condition: { maxAge: DATA_EXPORT_RETENTION_MS / 1000, type: "Age" } },
        enabled: true,
        id: "delete-data-exports-after-retention",
      },
    ],
  },
  { parent: devR2EsposterUserAssets, protect: true },
);
