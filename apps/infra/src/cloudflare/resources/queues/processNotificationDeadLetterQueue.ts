import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const processNotificationDeadLetterQueue: cloudflare.Queue = new cloudflare.Queue(
  "queue-process-notification-dlq",
  { accountId: CloudflareAccountId, queueName: "process-notification-dlq" },
  { protect: true },
);
