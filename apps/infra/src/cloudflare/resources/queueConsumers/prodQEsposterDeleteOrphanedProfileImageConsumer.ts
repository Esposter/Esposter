import type * as cloudflare from "@pulumi/cloudflare";

import { createQueueConsumer } from "#src/cloudflare/services/createQueueConsumer";
import { CloudflareEnvironment, QueueJob } from "@esposter/db-schema";

export const prodQEsposterDeleteOrphanedProfileImageConsumer: cloudflare.QueueConsumer = createQueueConsumer(
  CloudflareEnvironment.Production,
  QueueJob.DeleteOrphanedProfileImage,
);
