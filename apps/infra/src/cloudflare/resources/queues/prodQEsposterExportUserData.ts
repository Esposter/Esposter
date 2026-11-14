import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const prodQEsposterExportUserData: cloudflare.Queue = new cloudflare.Queue(
  "queue-export-user-data",
  { accountId: CloudflareAccountId, queueName: "export-user-data" },
  { protect: true },
);
