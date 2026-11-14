import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devProcessNotification: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-process-notification",
  { accountId: CloudflareAccountId, queueName: "dev-process-notification" },
  { protect: true },
);
