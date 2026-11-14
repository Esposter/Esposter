import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const prodQEsposterProcessBlobDeletion: cloudflare.Queue = new cloudflare.Queue(
  "queue-process-blob-deletion",
  { accountId: CloudflareAccountId, queueName: "process-blob-deletion" },
  { protect: true },
);
