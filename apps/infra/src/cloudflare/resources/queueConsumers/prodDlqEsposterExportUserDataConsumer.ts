import type * as cloudflare from "@pulumi/cloudflare";

import { createDeadLetterQueueConsumer } from "#src/cloudflare/services/createDeadLetterQueueConsumer";
import { CloudflareEnvironment, QueueJob } from "@esposter/db-schema";

export const prodDlqEsposterExportUserDataConsumer: cloudflare.QueueConsumer = createDeadLetterQueueConsumer(
  CloudflareEnvironment.Production,
  QueueJob.ExportUserData,
);
