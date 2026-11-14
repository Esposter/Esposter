import type { QueueJob } from "@esposter/db-schema";

import { QueueJobBindingNameMap } from "@esposter/db-schema";
import { env } from "cloudflare:workers";

// The functions Worker sends one job's messages, the notification queue, which its binding names. Stated on the job
// rather than on the binding, so the binding is read through the shared job map and never repeated at a call site
export const getJobQueue = (job: QueueJob.ProcessNotification) => env[QueueJobBindingNameMap[job]];
