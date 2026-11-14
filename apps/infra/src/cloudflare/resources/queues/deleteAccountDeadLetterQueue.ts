import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const deleteAccountDeadLetterQueue: cloudflare.Queue = new cloudflare.Queue(
  "queue-delete-account-dlq",
  { accountId: CloudflareAccountId, queueName: "delete-account-dlq" },
  { protect: true },
);
