import type * as cloudflare from "@pulumi/cloudflare";

import { createQueueConsumer } from "#src/cloudflare/services/createQueueConsumer";
import { CloudflareEnvironment, QueueJob } from "@esposter/db-schema";

export const prodQEsposterExportUserDataConsumer: cloudflare.QueueConsumer = createQueueConsumer(
  CloudflareEnvironment.Production,
  QueueJob.ExportUserData,
);
