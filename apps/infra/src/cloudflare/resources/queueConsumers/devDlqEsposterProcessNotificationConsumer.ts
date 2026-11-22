import type * as cloudflare from "@pulumi/cloudflare";

import { createDeadLetterQueueConsumer } from "#src/cloudflare/services/createDeadLetterQueueConsumer";
import { CloudflareEnvironment, QueueJob } from "@esposter/db-schema";

export const devDlqEsposterProcessNotificationConsumer: cloudflare.QueueConsumer = createDeadLetterQueueConsumer(
  CloudflareEnvironment.Development,
  QueueJob.ProcessNotification,
);
