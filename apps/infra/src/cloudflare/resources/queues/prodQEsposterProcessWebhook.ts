import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const prodQEsposterProcessWebhook: cloudflare.Queue = new cloudflare.Queue(
  "queue-process-webhook",
  { accountId: CloudflareAccountId, queueName: "process-webhook" },
  { protect: true },
);
