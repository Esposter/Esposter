import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devProcessWebhookDeadLetterQueue: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-process-webhook-dlq",
  { accountId: CloudflareAccountId, queueName: "dev-process-webhook-dlq" },
  { protect: true },
);
