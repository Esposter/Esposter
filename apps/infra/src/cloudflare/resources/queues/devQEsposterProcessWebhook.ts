import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devQEsposterProcessWebhook: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-process-webhook",
  { accountId: CloudflareAccountId, queueName: "dev-process-webhook" },
  { protect: true },
);
