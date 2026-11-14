import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const processScheduledMessageJobDeadLetterQueue: cloudflare.Queue = new cloudflare.Queue(
  "queue-process-scheduled-message-job-dlq",
  { accountId: CloudflareAccountId, queueName: "process-scheduled-message-job-dlq" },
  { protect: true },
);
