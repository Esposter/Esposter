import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const processNotification: cloudflare.Queue = new cloudflare.Queue(
  "queue-process-notification",
  { accountId: CloudflareAccountId, queueName: "process-notification" },
  { protect: true },
);
