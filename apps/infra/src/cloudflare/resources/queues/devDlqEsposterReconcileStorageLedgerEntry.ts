import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devDlqEsposterReconcileStorageLedgerEntry: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-reconcile-storage-ledger-entry-dlq",
  { accountId: CloudflareAccountId, queueName: "dev-reconcile-storage-ledger-entry-dlq" },
  { protect: true },
);
