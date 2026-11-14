import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devQEsposterProcessBlobDeletion: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-process-blob-deletion",
  { accountId: CloudflareAccountId, queueName: "dev-process-blob-deletion" },
  { protect: true },
);
