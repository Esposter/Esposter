import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const prodQEsposterProcessScheduledMessageJob: cloudflare.Queue = new cloudflare.Queue(
  "queue-process-scheduled-message-job",
  { accountId: CloudflareAccountId, queueName: "process-scheduled-message-job" },
  { protect: true },
);
