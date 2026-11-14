import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const prodDlqEsposterDeleteOrphanedProfileImage: cloudflare.Queue = new cloudflare.Queue(
  "queue-delete-orphaned-profile-image-dlq",
  { accountId: CloudflareAccountId, queueName: "delete-orphaned-profile-image-dlq" },
  { protect: true },
);
