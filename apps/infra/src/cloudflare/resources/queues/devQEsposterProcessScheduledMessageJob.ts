import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devQEsposterProcessScheduledMessageJob: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-process-scheduled-message-job",
  { accountId: CloudflareAccountId, queueName: "dev-process-scheduled-message-job" },
  { protect: true },
);
