import type * as cloudflare from "@pulumi/cloudflare";

import { createDeadLetterQueueConsumer } from "#src/cloudflare/services/createDeadLetterQueueConsumer";
import { CloudflareEnvironment, QueueJob } from "@esposter/db-schema";

export const prodDlqEsposterProcessBlobDeletionConsumer: cloudflare.QueueConsumer = createDeadLetterQueueConsumer(
  CloudflareEnvironment.Production,
  QueueJob.ProcessBlobDeletion,
);
