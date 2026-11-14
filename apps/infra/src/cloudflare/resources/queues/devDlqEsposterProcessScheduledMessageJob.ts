import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devDlqEsposterProcessScheduledMessageJob: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-process-scheduled-message-job-dlq",
  { accountId: CloudflareAccountId, queueName: "dev-process-scheduled-message-job-dlq" },
  { protect: true },
);
