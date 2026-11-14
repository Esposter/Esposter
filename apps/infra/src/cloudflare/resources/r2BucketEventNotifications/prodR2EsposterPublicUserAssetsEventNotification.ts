import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { prodQEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/prodQEsposterDeleteOrphanedProfileImage";
import { prodR2EsposterPublicUserAssets } from "#src/cloudflare/resources/r2Buckets/prodR2EsposterPublicUserAssets";
import * as cloudflare from "@pulumi/cloudflare";

// Object creation is the only event this notification carries.
export const prodR2EsposterPublicUserAssetsEventNotification: cloudflare.R2BucketEventNotification =
  new cloudflare.R2BucketEventNotification(
    "r2BucketEventNotification-public-user-assets",
    {
      accountId: CloudflareAccountId,
      bucketName: prodR2EsposterPublicUserAssets.name,
      queueId: prodQEsposterDeleteOrphanedProfileImage.queueId,
      rules: [{ actions: ["PutObject", "CopyObject"] }],
    },
    { parent: prodR2EsposterPublicUserAssets, protect: true },
  );
