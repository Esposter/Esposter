import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const processWebhook: cloudflare.Queue = new cloudflare.Queue(
  "queue-process-webhook",
  { accountId: CloudflareAccountId, queueName: "process-webhook" },
  { protect: true },
);
