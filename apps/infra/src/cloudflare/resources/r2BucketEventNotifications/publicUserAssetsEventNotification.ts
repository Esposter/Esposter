import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { deleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/deleteOrphanedProfileImage";
import { publicUserAssets } from "#src/cloudflare/resources/r2Buckets/publicUserAssets";
import * as cloudflare from "@pulumi/cloudflare";

// Object creation is the only event this notification carries.
export const publicUserAssetsEventNotification: cloudflare.R2BucketEventNotification =
  new cloudflare.R2BucketEventNotification(
    "r2BucketEventNotification-public-user-assets",
    {
      accountId: CloudflareAccountId,
      bucketName: publicUserAssets.name,
      queueId: deleteOrphanedProfileImage.queueId,
      rules: [{ actions: ["PutObject", "CopyObject"] }],
    },
    { parent: publicUserAssets, protect: true },
  );
