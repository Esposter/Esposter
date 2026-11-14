import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const processWebhookDeadLetterQueue: cloudflare.Queue = new cloudflare.Queue(
  "queue-process-webhook-dlq",
  { accountId: CloudflareAccountId, queueName: "process-webhook-dlq" },
  { protect: true },
);
