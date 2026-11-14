import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devProcessNotificationDeadLetterQueue: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-process-notification-dlq",
  { accountId: CloudflareAccountId, queueName: "dev-process-notification-dlq" },
  { protect: true },
);
