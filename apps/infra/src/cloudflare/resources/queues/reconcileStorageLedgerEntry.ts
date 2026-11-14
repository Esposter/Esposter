import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const reconcileStorageLedgerEntry: cloudflare.Queue = new cloudflare.Queue(
  "queue-reconcile-storage-ledger-entry",
  { accountId: CloudflareAccountId, queueName: "reconcile-storage-ledger-entry" },
  { protect: true },
);
