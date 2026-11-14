import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devDeleteOrphanedProfileImageDeadLetterQueue: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-delete-orphaned-profile-image-dlq",
  { accountId: CloudflareAccountId, queueName: "dev-delete-orphaned-profile-image-dlq" },
  { protect: true },
);
