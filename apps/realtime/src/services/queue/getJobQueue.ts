import type { QueueJob } from "@esposter/db-schema";

import { QueueJobBindingNameMap } from "@esposter/db-schema";
import { env } from "cloudflare:workers";

// The realtime Worker's one producer, the notification job's queue, which a due reminder is sent through.
// The job is keyed on the map, so the binding is read through the shared job map and never repeated at a call site.
export const getJobQueue = (job: typeof QueueJob.ProcessNotification) => env[QueueJobBindingNameMap[job]];
