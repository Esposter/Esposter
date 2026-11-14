import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devDeleteOrphanedProfileImage: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-delete-orphaned-profile-image",
  { accountId: CloudflareAccountId, queueName: "dev-delete-orphaned-profile-image" },
  { protect: true },
);
