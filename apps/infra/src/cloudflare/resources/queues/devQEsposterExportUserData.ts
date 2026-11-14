import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devQEsposterExportUserData: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-export-user-data",
  { accountId: CloudflareAccountId, queueName: "dev-export-user-data" },
  { protect: true },
);
