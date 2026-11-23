import type { CloudflareAssetType, CloudflareEnvironment, QueueJob } from "@esposter/db-schema";

import { getCloudflareResourceName, QueueJobs } from "@esposter/db-schema";

// The job whose queue, or whose dead-letter queue, this environment names as `queueName`. Each name is built by the
// Same function Pulumi creates the queue by and is compared with, never parsed back into a job. A name that only
// Resembles one is not mistaken for it.
export const findQueueJob = (
  environment: CloudflareEnvironment,
  assetType: CloudflareAssetType,
  queueName: string,
): QueueJob | undefined =>
  QueueJobs.find((job) => getCloudflareResourceName(environment, assetType, job) === queueName);
