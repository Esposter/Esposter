import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devDlqEsposterExportUserData: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-export-user-data-dlq",
  { accountId: CloudflareAccountId, queueName: "dev-export-user-data-dlq" },
  { protect: true },
);
