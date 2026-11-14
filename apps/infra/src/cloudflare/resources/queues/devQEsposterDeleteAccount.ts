import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devQEsposterDeleteAccount: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-delete-account",
  { accountId: CloudflareAccountId, queueName: "dev-delete-account" },
  { protect: true },
);
