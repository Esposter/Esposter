import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const prodDlqEsposterProcessBlobDeletion: cloudflare.Queue = new cloudflare.Queue(
  "queue-process-blob-deletion-dlq",
  { accountId: CloudflareAccountId, queueName: "process-blob-deletion-dlq" },
  { protect: true },
);
