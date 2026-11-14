import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const prodDlqEsposterExportUserData: cloudflare.Queue = new cloudflare.Queue(
  "queue-export-user-data-dlq",
  { accountId: CloudflareAccountId, queueName: "export-user-data-dlq" },
  { protect: true },
);
