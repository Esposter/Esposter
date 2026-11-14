import type { QueueJob } from "@esposter/db-schema";

import { getOrCreate } from "@esposter/shared";
import { describe } from "vitest";

// Every message sent to the notification queue, in send order. Stands in for the producer binding, which only exists
// inside the Worker, so a test reads what a publisher sent without a Workers runtime
export const MockJobQueueDatabase: Map<QueueJob, unknown[]> = new Map<QueueJob, unknown[]>();

export class MockJobQueue {
  readonly job: QueueJob;

  constructor(job: QueueJob) {
    this.job = job;
  }

  send(body: unknown): Promise<unknown> {
    getOrCreate(MockJobQueueDatabase, this.job, () => []).push(body);
    return Promise.resolve();
  }
}

export const getJobQueue = (job: QueueJob.ProcessNotification) => new MockJobQueue(job);

describe.todo("getJobQueue");
