import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { prodQEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/prodQEsposterDeleteOrphanedProfileImage";
import { prodR2EsposterPublicUserAssets } from "#src/cloudflare/resources/r2Buckets/prodR2EsposterPublicUserAssets";
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
  StorageBucket.PublicUserAssets,
);

// Object creation is the only event this notification carries.
export const prodR2EsposterPublicUserAssetsEventNotification: cloudflare.R2BucketEventNotification =
  new cloudflare.R2BucketEventNotification(
    `${bucketName}-event-notification`,
    {
      accountId: CloudflareAccountId,
      bucketName: prodR2EsposterPublicUserAssets.name,
      queueId: prodQEsposterDeleteOrphanedProfileImage.queueId,
      rules: [{ actions: ["PutObject", "CopyObject"] }],
    },
    { parent: prodR2EsposterPublicUserAssets, protect: true },
  );
