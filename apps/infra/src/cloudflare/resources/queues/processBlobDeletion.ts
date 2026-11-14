import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const processBlobDeletion: cloudflare.Queue = new cloudflare.Queue(
  "queue-process-blob-deletion",
  { accountId: CloudflareAccountId, queueName: "process-blob-deletion" },
  { protect: true },
);
