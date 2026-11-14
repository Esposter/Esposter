import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const prodDlqEsposterReconcileStorageLedgerEntry: cloudflare.Queue = new cloudflare.Queue(
  "queue-reconcile-storage-ledger-entry-dlq",
  { accountId: CloudflareAccountId, queueName: "reconcile-storage-ledger-entry-dlq" },
  { protect: true },
);
