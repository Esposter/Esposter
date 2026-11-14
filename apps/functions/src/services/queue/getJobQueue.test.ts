import type { QueueJob } from "@esposter/db-schema";

import { getOrCreate } from "@esposter/shared";
import { describe } from "vitest";

// Every message sent to each job's queue, in send order.
// It stands in for the producer binding, which only exists inside the Worker, so a test reads what a publisher sent.
// A test needs no Workers runtime to read it.
export const MockJobQueueDatabase: Map<QueueJob, unknown[]> = new Map<QueueJob, unknown[]>();

// The producer binding's own `Queue` interface, so the double is what `getJobQueue` returns.
// Nothing is ever backed up here, so every backlog it reports is empty.
export class MockJobQueue implements Queue {
  readonly job: QueueJob;
  readonly #backlog = { backlogBytes: 0, backlogCount: 0 };

  constructor(job: QueueJob) {
    this.job = job;
  }

  metrics(): Promise<QueueMetrics> {
    return Promise.resolve(this.#backlog);
  }

  send(body: unknown): Promise<QueueSendResponse> {
    this.#record(body);
    return Promise.resolve({ metadata: { metrics: this.#backlog } });
  }

  sendBatch(messages: Iterable<MessageSendRequest>): Promise<QueueSendBatchResponse> {
    for (const { body } of messages) this.#record(body);
    return Promise.resolve({ metadata: { metrics: this.#backlog } });
  }

  #record(body: unknown) {
    getOrCreate(MockJobQueueDatabase, this.job, () => []).push(body);
  }
}

export const getJobQueue = (job: QueueJob) => new MockJobQueue(job);

describe.todo("getJobQueue");
