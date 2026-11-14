import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { devQEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/devQEsposterDeleteOrphanedProfileImage";
import { devR2EsposterPublicUserAssets } from "#src/cloudflare/resources/r2Buckets/devR2EsposterPublicUserAssets";
import {
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
  StorageBucket,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const bucketName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.R2Bucket,
  StorageBucket.PublicUserAssets,
);

// Object creation is the only event this notification carries.
export const devR2EsposterPublicUserAssetsEventNotification: cloudflare.R2BucketEventNotification =
  new cloudflare.R2BucketEventNotification(
    `${bucketName}-event-notification`,
    {
      accountId: CloudflareAccountId,
      bucketName: devR2EsposterPublicUserAssets.name,
      queueId: devQEsposterDeleteOrphanedProfileImage.queueId,
      rules: [{ actions: ["PutObject", "CopyObject"] }],
    },
    { parent: devR2EsposterPublicUserAssets, protect: true },
  );
