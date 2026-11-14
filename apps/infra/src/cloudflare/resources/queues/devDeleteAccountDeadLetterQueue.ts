import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devDeleteAccountDeadLetterQueue: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-delete-account-dlq",
  { accountId: CloudflareAccountId, queueName: "dev-delete-account-dlq" },
  { protect: true },
);
