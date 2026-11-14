import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { devDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/devDeleteOrphanedProfileImage";
import { devPublicUserAssets } from "#src/cloudflare/resources/r2Buckets/devPublicUserAssets";
import * as cloudflare from "@pulumi/cloudflare";

// Object creation is the only event this notification carries.
export const devPublicUserAssetsEventNotification: cloudflare.R2BucketEventNotification =
  new cloudflare.R2BucketEventNotification(
    "r2BucketEventNotification-dev-public-user-assets",
    {
      accountId: CloudflareAccountId,
      bucketName: devPublicUserAssets.name,
      queueId: devDeleteOrphanedProfileImage.queueId,
      rules: [{ actions: ["PutObject", "CopyObject"] }],
    },
    { parent: devPublicUserAssets, protect: true },
  );
