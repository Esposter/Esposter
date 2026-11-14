import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devDlqEsposterProcessBlobDeletion: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-process-blob-deletion-dlq",
  { accountId: CloudflareAccountId, queueName: "dev-process-blob-deletion-dlq" },
  { protect: true },
);
