import type { QueueJob } from "@esposter/db-schema";

// Every message sent to each job's queue, in send order. It stands in for the producer binding, which only exists
// Inside the worker, so a test reads what a publisher sent. A test needs no Workers runtime to read it
export const MockJobQueueDatabase: Map<QueueJob, unknown[]> = new Map<QueueJob, unknown[]>();
