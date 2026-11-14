import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const prodQEsposterDeleteOrphanedProfileImage: cloudflare.Queue = new cloudflare.Queue(
  "queue-delete-orphaned-profile-image",
  { accountId: CloudflareAccountId, queueName: "delete-orphaned-profile-image" },
  { protect: true },
);
