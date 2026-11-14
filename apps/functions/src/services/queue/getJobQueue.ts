import type { QueueJob } from "@esposter/db-schema";

import { QueueJobBindingNameMap } from "@esposter/db-schema";
import { env } from "cloudflare:workers";

// The functions Worker's producer for one job's queue, which its binding names.
// It sends the notification queue's messages, and republishes a dead letter to the queue it failed in.
// It is keyed on the job, so the binding is read through the shared job map and never repeated at a call site.
export const getJobQueue = (job: QueueJob) => env[QueueJobBindingNameMap[job]];
