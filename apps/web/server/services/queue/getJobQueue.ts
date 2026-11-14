import type { QueueJob, QueueProducer } from "@esposter/db-schema";

import { QueueJobBindingNameMap } from "@esposter/db-schema";
import { env } from "cloudflare:workers";

// The producer a job's messages are sent through, read from the Worker's bindings under the job's binding name. A
// Publisher names its job here rather than a binding, so each binding name is written once, in the shared job map
export const getJobQueue = (job: QueueJob): QueueProducer<unknown> => env[QueueJobBindingNameMap[job]];
