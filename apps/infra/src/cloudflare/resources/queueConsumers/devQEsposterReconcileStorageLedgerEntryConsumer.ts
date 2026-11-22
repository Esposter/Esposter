import type * as cloudflare from "@pulumi/cloudflare";

import { createQueueConsumer } from "#src/cloudflare/services/createQueueConsumer";
import { CloudflareEnvironment, QueueJob } from "@esposter/db-schema";

export const devQEsposterReconcileStorageLedgerEntryConsumer: cloudflare.QueueConsumer = createQueueConsumer(
  CloudflareEnvironment.Development,
  QueueJob.ReconcileStorageLedgerEntry,
);
