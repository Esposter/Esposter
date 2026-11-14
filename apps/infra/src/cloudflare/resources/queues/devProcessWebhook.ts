import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devProcessWebhook: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-process-webhook",
  { accountId: CloudflareAccountId, queueName: "dev-process-webhook" },
  { protect: true },
);
