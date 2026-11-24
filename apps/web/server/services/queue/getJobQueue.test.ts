import type { QueueJob, QueueProducer } from "@esposter/db-schema";

import { MockJobQueueDatabase } from "@esposter/db-mock";
import { getOrCreate } from "@esposter/shared";
import { describe } from "vitest";

// This double is the send-only `QueueProducer` the shared schema states, which is what the app's getJobQueue returns.
// The Workers double in `@esposter/db-mock/workers` is the whole binding, and only apps/jobs and apps/realtime import
// That entry. so this one stays beside its only consumer, and its messages land in the map every job's test reads.
export class MockJobQueue implements QueueProducer<unknown> {
  readonly job: QueueJob;

  constructor(job: QueueJob) {
    this.job = job;
  }

  send(body: unknown): Promise<unknown> {
    getOrCreate(MockJobQueueDatabase, this.job, () => []).push(body);
    return Promise.resolve();
  }
}

export const getJobQueue = (job: QueueJob): QueueProducer<unknown> => new MockJobQueue(job);

describe.todo("getJobQueue");
