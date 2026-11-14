import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const deleteAccount: cloudflare.Queue = new cloudflare.Queue(
  "queue-delete-account",
  { accountId: CloudflareAccountId, queueName: "delete-account" },
  { protect: true },
);
